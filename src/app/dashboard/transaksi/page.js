"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/utlis/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, addDoc } from "firebase/firestore";
import Link from "next/link";

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const transaksiCollectionRef = collection(db, "transaksi");
  const router = useRouter();

  useEffect(() => {
    const fetchTransaksi = async () => {
      const q = query(transaksiCollectionRef, orderBy("tanggal", "desc"));
      const data = await getDocs(q);
      setTransaksi(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchTransaksi();
  }, []);

  const handleDelete = async (id) => {
    const transaksiDoc = doc(db, "transaksi", id);
    try {
      const transaksiSnap = await getDoc(transaksiDoc);
      if (transaksiSnap.exists()) {
        const transaksiData = transaksiSnap.data();
        const { selectedProducts } = transaksiData;

        for (let product of selectedProducts) {
          const barangDocRef = doc(db, "dataBarang", product.id);
          const barangSnap = await getDoc(barangDocRef);

          if (barangSnap.exists()) {
            const barangData = barangSnap.data();
            const updatedQuantity = barangData.quantity + product.quantity;
            await updateDoc(barangDocRef, { quantity: updatedQuantity });
            console.log(`Stok barang ${product.name} berhasil dikembalikan.`);
          } else {
            console.error(`Barang dengan ID ${product.id} tidak ditemukan.`);
          }
        }

        await deleteDoc(transaksiDoc);
        setTransaksi(transaksi.filter((trans) => trans.id !== id));
        console.log("Transaksi berhasil dihapus.");
      } else {
        console.error("Transaksi tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  const handleAddTransaksi = async () => {
    const newTransaksi = {
      kodeTransaksi: generateKodeTransaksi(),
      keteranganService: "Keterangan Baru",
      selectedProducts: [],
      totalHarga: 0,
      clientPayment: 0,
      kembalian: 0,
      tanggal: new Date(),
    };

    try {
      const docRef = await addDoc(transaksiCollectionRef, newTransaksi);
      console.log("Transaksi berhasil ditambahkan dengan ID:", docRef.id);
      router.push(`/dashboard/transaksi/form?id=${docRef.id}`);
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  const generateKodeTransaksi = () => {
    return `TRANS-${Date.now()}`;
  };

  const handlePrint = (trans) => {
    const printContent = `
      <html>
        <head>
          <title>Cetak Struk</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt-container { max-width: 350px; margin: auto; border: 1px solid #ddd; padding: 15px; }
            .store-info { text-align: center; margin-bottom: 20px; }
            .item-list { width: 100%; margin-bottom: 10px; }
            .item-list th, .item-list td { text-align: left; padding: 5px; }
            .item-list th { border-bottom: 1px solid #000; }
            .total-section { text-align: right; margin-top: 10px; }
            .thanks-message { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="store-info">
              <h2>Digitalia</h2>
              <p>Kp. Babakan, RT.01/RW.05, Desa Leuwiliang, Kec. Leuwiliang, Kab. Bogor, 16640</p>
              <p>No. Telp 0813986302939</p>
            </div>
            <table class="item-list">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Harga</th></tr>
              </thead>
              <tbody>
                ${trans.selectedProducts.map((product) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>Rp ${product.price}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <h3>Total: Rp ${trans.totalHarga}</h3>
              <h3>Bayar (Cash): Rp ${trans.clientPayment}</h3>
              <h3>Kembali: Rp ${(trans.clientPayment - trans.totalHarga).toFixed(2)}</h3>
            </div>
            <div class="thanks-message">
              <p>Terimakasih Telah Berbelanja</p>
              <p>Link Kritik dan Saran: digitalia.web.app/e-receipt</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <section>
      <div className="transaksi__container container">
        <h1>Daftar Transaksi</h1>
        <button onClick={handleAddTransaksi} className="btn btn-create">Tambah Transaksi</button>
        <table className="transaksi-table">
          <thead>
            <tr>
              <th>Kode Transaksi</th>
              <th>Keterangan Service</th>
              <th>Quantity</th>
              <th>Harga Satuan</th>
              <th>Total Harga</th>
              <th>Uang Client</th>
              <th>Kembalian</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length > 0 ? (
              transaksi.map((trans) =>
                trans.selectedProducts.map((product, index) => (
                  <tr key={`${trans.id}-${index}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={trans.selectedProducts.length}>{trans.kodeTransaksi || "N/A"}</td>
                        <td rowSpan={trans.selectedProducts.length}>{trans.keteranganService || "N/A"}</td>
                      </>
                    )}
                    <td>{product.quantity}</td>
                    <td>Rp {product.price}</td>
                    {index === 0 && (
                      <>
                        <td rowSpan={trans.selectedProducts.length}>Rp {trans.totalHarga}</td>
                        <td rowSpan={trans.selectedProducts.length}>Rp {trans.clientPayment || "N/A"}</td>
                        <td rowSpan={trans.selectedProducts.length}>Rp {trans.kembalian || "N/A"}</td>
                        <td rowSpan={trans.selectedProducts.length}>
                          {new Date(trans.tanggal.seconds * 1000).toLocaleDateString()}
                        </td>
                        <td rowSpan={trans.selectedProducts.length}>
                          <Link href={`/dashboard/transaksi/form?id=${trans.id}`} className="btn btn-edit">Edit</Link>
                          <button onClick={() => handleDelete(trans.id)} className="btn btn-delete">Hapus</button>
                          <button onClick={() => handlePrint(trans)} className="btn btn-print">Cetak</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center" }}>Tidak ada transaksi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransaksiPage;