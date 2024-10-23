"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utlis/firebase";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function FormTransaksi() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [kodeTransaksi, setKodeTransaksi] = useState("");
  const [keteranganService, setKeteranganService] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [clientPayment, setClientPayment] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([{ id: "", quantity: 1, price: 0, name: "" }]);
  const [totalHarga, setTotalHarga] = useState(0);

  // Tambahkan state untuk menyimpan daftar produk
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const fetchTransaksi = async () => {
      if (id) {
        const transaksiDoc = doc(db, "transaksi", id);
        const transaksiSnap = await getDoc(transaksiDoc);
        if (transaksiSnap.exists()) {
          const data = transaksiSnap.data();
          setKodeTransaksi(data.kodeTransaksi || "");
          setKeteranganService(data.keteranganService || "");
          setTanggal(data.tanggal ? new Date(data.tanggal.seconds * 1000).toISOString().slice(0, 10) : "");
          setSelectedProducts(data.selectedProducts || []);
          setTotalHarga(data.totalHarga || 0);
          setClientPayment(data.clientPayment || 0);
        }
      }
    };

    const fetchProducts = async () => {
      // Ambil daftar produk dari Firestore
      const productSnapshot = await getDocs(collection(db, "dataBarang"));
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductList(productList);
    };

    fetchTransaksi();
    fetchProducts();
  }, [id]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setSelectedProducts(updatedProducts);

    // Jika field yang diubah adalah ID produk, secara otomatis update nama dan harga produk
    if (field === "id") {
      const selectedProduct = productList.find(product => product.id === value);
      if (selectedProduct) {
        updatedProducts[index].name = selectedProduct.name;
        updatedProducts[index].price = selectedProduct.price;
        setSelectedProducts(updatedProducts);
      }
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { id: "", quantity: 1, price: 0, name: "" }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const calculateTotalHarga = () => {
    let total = selectedProducts.reduce((acc, product) => acc + product.price * product.quantity, 0);
    setTotalHarga(total);
  };

  useEffect(() => {
    calculateTotalHarga();
  }, [selectedProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTransaksi = {
      kodeTransaksi,
      keteranganService,
      selectedProducts,
      totalHarga,
      clientPayment,
      kembalian: clientPayment - totalHarga,
      tanggal: new Date(tanggal),
    };

    try {
      if (id) {
        const transaksiDoc = doc(db, "transaksi", id);
        await updateDoc(transaksiDoc, newTransaksi);
        console.log("Transaksi berhasil diperbarui.");
      } else {
        await addDoc(collection(db, "transaksi"), newTransaksi);
        console.log("Transaksi berhasil ditambahkan.");
      }

      // Perbarui stok barang setelah transaksi ditambahkan
      for (let product of selectedProducts) {
        const barangDocRef = doc(db, "dataBarang", product.id);
        const barangDocSnap = await getDoc(barangDocRef);

        if (barangDocSnap.exists()) {
          const barangData = barangDocSnap.data();
          const updatedQuantity = barangData.quantity - product.quantity;

          if (updatedQuantity >= 0) {
            await updateDoc(barangDocRef, { quantity: updatedQuantity });
            console.log(`Stok barang ${product.name} berhasil diperbarui.`);
          } else {
            console.warn(`Stok barang ${product.name} tidak mencukupi.`);
          }
        } else {
          console.error(`Barang dengan ID ${product.id} tidak ditemukan.`);
        }
      }

      router.push("/dashboard/transaksi");
    } catch (error) {
      console.error("Error submitting transaction: ", error);
    }
  };

  return (
    <section>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <label>Kode Transaksi:</label>
          <input type="text" value={kodeTransaksi} onChange={(e) => setKodeTransaksi(e.target.value)} required />

          <label>Keterangan Service:</label>
          <textarea value={keteranganService} onChange={(e) => setKeteranganService(e.target.value)} required />

          <label>Tanggal:</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />

          <label>Produk:</label>
          {selectedProducts.map((product, index) => (
            <div key={index}>
              {/* Dropdown untuk memilih produk */}
              <select
                value={product.id}
                onChange={(e) => handleProductChange(index, "id", e.target.value)}
                required
              >
                <option value="">Pilih Produk</option>
                {productList.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={product.quantity}
                onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value))}
                required
              />
              <input type="number" placeholder="Harga" value={product.price} readOnly />
              <button type="button" onClick={() => handleRemoveProduct(index)}>Hapus Produk</button>
            </div>
          ))}
          <button type="button" onClick={handleAddProduct}>Tambah Produk</button>

          <label>Total Harga:</label>
          <input type="number" value={totalHarga} readOnly />

          <label>Uang Client:</label>
          <input type="number" value={clientPayment} onChange={(e) => setClientPayment(parseInt(e.target.value))} required />

          <label>Kembalian:</label>
          <input type="number" value={clientPayment - totalHarga} readOnly />

          <button type="submit">Simpan</button>
        </form>
      </div>
    </section>
  );
}
