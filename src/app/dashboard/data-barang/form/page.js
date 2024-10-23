"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utlis/firebase";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export default function Form() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [newKodeBarang, setNewKodeBarang] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const barangCollectionRef = collection(db, "dataBarang");

  useEffect(() => {
    const fetchBarang = async () => {
      if (id) {
        const barangDoc = doc(db, "dataBarang", id);
        const docSnap = await getDoc(barangDoc);
        if (docSnap.exists()) {
          const itemToEdit = { id: docSnap.id, ...docSnap.data() };
          setNewKodeBarang(itemToEdit.kodeBarang);
          setNewName(itemToEdit.name);
          setNewPrice(itemToEdit.price);
          setNewQuantity(itemToEdit.quantity);
        } else {
          console.error("No such document!");
        }
      }
    };

    fetchBarang();
  }, [id]);

  const handleSave = async () => {
    if (newKodeBarang && newName && newPrice > 0 && newQuantity >= 0) {
      if (id) {
        const barangDoc = doc(db, "dataBarang", id);
        await updateDoc(barangDoc, {
          kodeBarang: newKodeBarang,
          name: newName,
          price: newPrice,
          quantity: newQuantity,
        });
        alert("Barang berhasil diupdate.");
      } else {
        await addDoc(barangCollectionRef, {
          kodeBarang: newKodeBarang,
          name: newName,
          price: newPrice,
          quantity: newQuantity,
        });
        alert("Barang berhasil ditambahkan.");
      }

      setNewKodeBarang("");
      setNewName("");
      setNewPrice(0);
      setNewQuantity(0);

      router.push("/dashboard/data-barang");
    } else {
      alert("Semua field harus diisi dengan benar.");
    }
  };

  return (
    <section>
      <div className="form__container container">
        <h1>{id ? "Edit Barang" : "Tambah Barang"}</h1>
        <input
          type="text"
          placeholder="Kode Barang"
          value={newKodeBarang}
          onChange={(e) => setNewKodeBarang(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Nama Barang"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Harga"
          value={newPrice}
          onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
          className="input"
        />
        <input
          type="number"
          placeholder="Stok"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
          className="input"
        />
        <button onClick={handleSave} className="btn btn-create">
          {id ? "Update" : "Create"}
        </button>
      </div>
    </section>
  );
}
