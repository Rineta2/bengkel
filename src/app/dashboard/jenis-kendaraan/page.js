"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/utlis/firebase";

export default function JenisKendaraan() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ type: "", cost: "" });
  const [editingId, setEditingId] = useState(null);
  const [editVehicle, setEditVehicle] = useState({ type: "", cost: "" });

  const collectionRef = collection(db, "vehicleTypes");

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicleTypes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCreate = async () => {
    try {
      await addDoc(collectionRef, newVehicle);
      fetchVehicleTypes(); // Refresh the data
      setNewVehicle({ type: "", cost: "" });
    } catch (error) {
      console.error("Error creating vehicle type:", error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const docRef = doc(db, "vehicleTypes", id);
      await updateDoc(docRef, editVehicle);
      fetchVehicleTypes(); // Refresh the data
      setEditingId(null);
      setEditVehicle({ type: "", cost: "" });
    } catch (error) {
      console.error("Error updating vehicle type:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(db, "vehicleTypes", id);
      await deleteDoc(docRef);
      fetchVehicleTypes(); // Refresh the data
    } catch (error) {
      console.error("Error deleting vehicle type:", error);
    }
  };

  return (
    <div className="container">
      <h1>Manage Vehicle Types</h1>

      {/* Create New Vehicle Type */}
      <div>
        <input
          type="text"
          placeholder="Type"
          value={newVehicle.type}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, type: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Cost"
          value={newVehicle.cost}
          onChange={(e) =>
            setNewVehicle({ ...newVehicle, cost: e.target.value })
          }
        />
        <button onClick={handleCreate}>Add Vehicle</button>
      </div>

      {/* List of Vehicle Types */}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Type</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicleTypes.map((vehicle, index) => (
            <tr key={vehicle.id}>
              <td>{index + 1}</td>
              <td>
                {editingId === vehicle.id ? (
                  <input
                    type="text"
                    value={editVehicle.type}
                    onChange={(e) =>
                      setEditVehicle({ ...editVehicle, type: e.target.value })
                    }
                  />
                ) : (
                  vehicle.type
                )}
              </td>
              <td>
                {editingId === vehicle.id ? (
                  <input
                    type="number"
                    value={editVehicle.cost}
                    onChange={(e) =>
                      setEditVehicle({ ...editVehicle, cost: e.target.value })
                    }
                  />
                ) : (
                  vehicle.cost
                )}
              </td>
              <td>
                {editingId === vehicle.id ? (
                  <button onClick={() => handleUpdate(vehicle.id)}>Save</button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(vehicle.id);
                        setEditVehicle({
                          type: vehicle.type,
                          cost: vehicle.cost,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(vehicle.id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
