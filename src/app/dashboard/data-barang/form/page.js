"use client";
import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/utlis/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function FormBarang() {
  const [kodeBarang, setKodeBarang] = useState("");
  const [name, setName] = useState("");
  const [hargaModal, setHargaModal] = useState("");
  const [hargaJual, setHargaJual] = useState("");
  const [quantity, setQuantity] = useState("");
  const router = useRouter();

  // Generate kode barang otomatis
  useEffect(() => {
    const generateKodeBarang = () => {
      const timestamp = Date.now(); // Menggunakan timestamp sebagai kode barang
      setKodeBarang(`DB-${timestamp}`);
    };

    generateKodeBarang();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !hargaModal || !hargaJual || !quantity) {
      toast.error("Mohon isi semua kolom.");
      return;
    }

    try {
      await addDoc(collection(db, "dataBarang"), {
        kodeBarang,
        name,
        hargaModal: parseInt(hargaModal),
        hargaJual: parseInt(hargaJual),
        quantity: parseInt(quantity),
      });
      toast.success("Barang berhasil ditambahkan");
      router.push("/dashboard/data-barang");
    } catch (error) {
      toast.error("Terjadi kesalahan saat menambah barang");
      console.error("Error adding document: ", error);
    }
  };

  return (
    <section className="form-barang">
      <div className="barang__container container">
        <h1>Tambah Barang</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kode Barang</label>
            <input
              type="text"
              value={kodeBarang}
              disabled
              className="input-disabled"
            />
          </div>

          <div className="form-group">
            <label>Nama Barang</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Harga Modal</label>
            <input
              type="number"
              value={hargaModal}
              onChange={(e) => setHargaModal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Harga Jual</label>
            <input
              type="number"
              value={hargaJual}
              onChange={(e) => setHargaJual(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Stok Barang</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <button type="submit">Tambah Barang</button>
        </form>
      </div>
    </section>
  );
}
