// pages/dashboard.js
"use client";
import React from "react";
import ProtectedRoute from "@/components/auth/protect/ProtectedRoute";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>
          Ini adalah konten dashboard yang hanya bisa diakses oleh pengguna yang
          login.
        </p>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
