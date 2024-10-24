"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/utlis/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import Link from "next/link";
import jsPDF from "jspdf";
import { saveAs } from 'file-saver';

const TransaksiPage = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const transaksiCollectionRef = collection(db, "transaksi");
  const router = useRouter();

  useEffect(() => {
    const fetchTransaksi = async () => {
      setLoading(true);
      const q = query(transaksiCollectionRef, orderBy("tanggal", "desc"));
      const data = await getDocs(q);
      setTransaksi(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
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

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handlePrint = (trans) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(12);
    doc.text("Digitalia", 105, 10, null, null, "center");
    doc.text("Kp. Babakan, RT.01/RW.05, Desa Leuwiliang,", 105, 20, null, null, "center");
    doc.text("Kec. Leuwiliang, Kab. Bogor, 16640", 105, 30, null, null, "center");
    doc.text("No. Telp 0813986302939", 105, 40, null, null, "center");

    // Title
    doc.text("Struk Transaksi", 105, 50, null, null, "center");

    let yPosition = 60;

    // Produk yang dibeli
    trans.selectedProducts.forEach((product, index) => {
      doc.text(`${index + 1}. ${product.name} - Qty: ${product.quantity} - Harga: ${formatRupiah(product.price)}`, 20, yPosition);
      yPosition += 10;
    });

    // Total harga dan informasi lainnya
    yPosition += 10;
    doc.text(`Total: ${formatRupiah(trans.totalHarga)}`, 20, yPosition);
    doc.text(`Bayar: ${formatRupiah(trans.clientPayment)}`, 20, yPosition + 10);
    doc.text(`Kembalian: ${formatRupiah(trans.clientPayment - trans.totalHarga)}`, 20, yPosition + 20);

    // Footer
    doc.text("Terimakasih Telah Berbelanja!", 105, yPosition + 40, null, null, "center");

    // Generate PDF blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Membuka PDF di tab baru
    const newWindow = window.open(pdfUrl);

    // Setelah PDF dibuka, langsung cetak secara otomatis jika window berhasil dibuka
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.focus(); // Fokus ke window baru
        newWindow.print(); // Buka dialog print
      };
    } else {
      // Jika tidak bisa membuka tab baru (kemungkinan pada beberapa perangkat mobile)
      alert('Gagal membuka file PDF, pastikan pop-up diizinkan di browser.');
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const filteredTransaksi = transaksi.filter((trans) =>
    trans.kodeTransaksi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="transaksi">
      <div className="transaksi__container container">
        <div className="actions">
          <div className="title">
            <h1>Daftar Transaksi</h1>
          </div>
          <div className="form">
            <button onClick={handleAddTransaksi} className="btn btn-create">Tambah Transaksi</button>
          </div>
        </div>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Cari Kode Transaksi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <table className="barang-table">
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
              {filteredTransaksi.length > 0 ? (
                filteredTransaksi.map((trans) =>
                  trans.selectedProducts.map((product, index) => (
                    <tr key={`${trans.id}-${index}`}>
                      {index === 0 && (
                        <td rowSpan={trans.selectedProducts.length}>{trans.kodeTransaksi || "N/A"}</td>
                      )}
                      <td>{trans.keteranganService || "N/A"}</td>
                      <td>{product.quantity}</td>
                      <td>{formatRupiah(product.price)}</td>
                      {index === 0 && (
                        <>
                          <td rowSpan={trans.selectedProducts.length}>{formatRupiah(trans.totalHarga)}</td>
                          <td rowSpan={trans.selectedProducts.length}>{formatRupiah(trans.clientPayment || 0)}</td>
                          <td rowSpan={trans.selectedProducts.length}>{formatRupiah(trans.kembalian || 0)}</td>
                          <td rowSpan={trans.selectedProducts.length}>
                            {new Date(trans.tanggal.seconds * 1000).toLocaleDateString()}
                          </td>
                          <td rowSpan={trans.selectedProducts.length} className="action__btn">
                            <Link href={`/dashboard/transaksi/form?id=${trans.id}`} className="btn btn-edit">Edit</Link>
                            <button onClick={() => handleDelete(trans.id)} className="btn btn-delete">Hapus</button>
                            <button onClick={() => handlePrint(trans)} className="btn btn-print">Print</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )
              ) : (
                <tr>
                  <td colSpan="9">Tidak ada transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default TransaksiPage;