"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/utlis/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

export default function DataBarang() {
  const [barang, setBarang] = useState([]);
  const [newKodeBarang, setNewKodeBarang] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const barangCollectionRef = collection(db, "dataBarang");

  // Fetch data barang dari Firestore
  useEffect(() => {
    const getBarang = async () => {
      const data = await getDocs(barangCollectionRef);
      setBarang(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getBarang();
  }, []);

  // Fungsi untuk menambahkan atau memperbarui barang
  const handleSave = async () => {
    if (newKodeBarang && newName && newPrice > 0 && newQuantity > 0) {
      if (editMode && currentId) {
        // Update barang
        await updateBarang(currentId, newName, newPrice, newQuantity);
      } else {
        // Tambah barang baru
        await addDoc(barangCollectionRef, {
          kodeBarang: newKodeBarang,
          name: newName,
          price: newPrice,
          quantity: newQuantity,
        });
      }
      setNewKodeBarang("");
      setNewName("");
      setNewPrice(0);
      setNewQuantity(0);
      setEditMode(false);
      setCurrentId(null);

      // Refresh data setelah penambahan atau update
      const data = await getDocs(barangCollectionRef);
      setBarang(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } else {
      alert("Semua field harus diisi dengan benar.");
    }
  };

  // Fungsi untuk mempersiapkan update barang
  const prepareUpdate = (id, kodeBarang, name, price, quantity) => {
    setNewKodeBarang(kodeBarang);
    setNewName(name);
    setNewPrice(price);
    setNewQuantity(quantity);
    setEditMode(true);
    setCurrentId(id);
  };

  // Fungsi untuk memperbarui barang
  const updateBarang = async (
    id,
    updatedName,
    updatedPrice,
    updatedQuantity
  ) => {
    const barangDoc = doc(db, "dataBarang", id);
    try {
      const docSnapshot = await getDoc(barangDoc);
      if (docSnapshot.exists()) {
        await updateDoc(barangDoc, {
          name: updatedName,
          price: updatedPrice,
          quantity: updatedQuantity,
        });
        alert("Update berhasil");

        const data = await getDocs(barangCollectionRef);
        setBarang(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } else {
        alert("Dokumen tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  // Fungsi untuk menghapus barang
  const deleteBarang = async (id) => {
    const barangDoc = doc(db, "dataBarang", id);
    try {
      await deleteDoc(barangDoc);
      alert("Hapus berhasil");

      const data = await getDocs(barangCollectionRef);
      setBarang(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Filter barang berdasarkan pencarian
  const filteredBarang = barang.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="data">
      <div className="barang__container container">
        <h1>Data Barang</h1>
        <div className="toolbar">
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
            onChange={(e) => setNewPrice(parseInt(e.target.value))}
            className="input"
          />
          <input
            type="number"
            placeholder="Stok"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value))}
            className="input"
          />
          <button onClick={handleSave} className="btn btn-create">
            {editMode ? "Update" : "Create"}
          </button>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <table className="barang-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Barang</th>
              <th>Nama Barang</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBarang.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.kodeBarang}</td>
                <td>{item.name}</td>
                <td>Rp {item.price.toLocaleString()}</td>
                <td>{item.quantity}</td>
                <td>
                  <button
                    className="btn btn-update"
                    onClick={() =>
                      prepareUpdate(
                        item.id,
                        item.kodeBarang,
                        item.name,
                        item.price,
                        item.quantity
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => deleteBarang(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="total-records">
          <p>Total Record: {filteredBarang.length}</p>
        </div>
      </div>
    </section>
  );
}
