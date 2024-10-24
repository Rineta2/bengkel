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
  const [kembalian, setKembalian] = useState(0);
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
        } else {
          console.log("Transaksi tidak ditemukan.");
        }
      }
    };

    const fetchProducts = async () => {
      const productSnapshot = await getDocs(collection(db, "dataBarang"));
      const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductList(products);
    };

    fetchTransaksi();
    fetchProducts();
  }, [id]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    if (field === "id") {
      const selectedProduct = productList.find(product => product.id === value);
      if (selectedProduct) {
        updatedProducts[index].name = selectedProduct.name;
        updatedProducts[index].price = selectedProduct.hargaJual || 0;
      }
    }
    setSelectedProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { id: "", quantity: 1, price: 0, name: "" }]);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const calculateTotalHarga = () => {
    const total = selectedProducts.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    setTotalHarga(total);
  };

  const calculateKembalian = () => {
    setKembalian(clientPayment - totalHarga);
  };

  useEffect(() => {
    calculateTotalHarga();
  }, [selectedProducts]);

  useEffect(() => {
    calculateKembalian();
  }, [clientPayment, totalHarga]);

  const updateProductQuantities = async () => {
    for (const product of selectedProducts) {
      const productDoc = doc(db, "dataBarang", product.id);
      const productSnap = await getDoc(productDoc);

      if (productSnap.exists()) {
        const currentQuantity = productSnap.data().quantity || 0;
        const newQuantity = currentQuantity - product.quantity;

        await updateDoc(productDoc, { quantity: newQuantity });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTransaksi = {
      kodeTransaksi,
      keteranganService,
      selectedProducts,
      totalHarga,
      clientPayment,
      kembalian,
      tanggal: new Date(tanggal), // Pastikan tanggal adalah objek Date
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

      // Perbarui jumlah produk di koleksi dataBarang
      await updateProductQuantities();

      router.push("/dashboard/transaksi");
    } catch (error) {
      console.error("Error adding/updating transaksi: ", error);
    }
  };

  return (
    <section>
      <div className="container">
        <div className="content">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Kode Transaksi"
              value={kodeTransaksi}
              onChange={(e) => setKodeTransaksi(e.target.value)}
              required
            />
            <textarea
              placeholder="Keterangan"
              value={keteranganService}
              onChange={(e) => setKeteranganService(e.target.value)}
              required
            />
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
            <div>
              {selectedProducts.map((product, index) => (
                <div key={index}>
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
                    placeholder="Jumlah"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveProduct(index)}>Hapus</button>
                </div>
              ))}
              <button type="button" onClick={handleAddProduct}>Tambah Produk</button>
            </div>
            <div>
              <h3>Total Harga: Rp {totalHarga.toLocaleString()}</h3>
              <input
                type="number"
                placeholder="Pembayaran"
                value={clientPayment}
                onChange={(e) => setClientPayment(Number(e.target.value))}
                required
              />
              <h3>Kembalian: Rp {kembalian.toLocaleString()}</h3>
            </div>

            <button type="submit" className="btn btn-primary">
              {id ? "Perbarui Transaksi" : "Tambah Transaksi"}
            </button>

          </form>
        </div>
      </div>
    </section>
  );
}
