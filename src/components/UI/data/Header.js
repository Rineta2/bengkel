import {
  House,
  Book,
  CreditCard,
  Users,
  ArrowLeftRight,
  ReceiptText,
} from "lucide-react";

import { FaMotorcycle } from "react-icons/fa";

export const navLink = [
  {
    id: 1,
    name: "Dashboard",
    icon: <House />,
    path: "/dashboard",
  },

  {
    id: 2,
    name: "Data Barang",
    icon: <Book />,
    path: "/dashboard/data-barang",
  },

  {
    id: 3,
    name: "Jenis Kendaraan",
    icon: <FaMotorcycle />,
    path: "/dashboard/jenis-kendaraan",
  },

  {
    id: 4,
    name: "Transaksi",
    icon: <CreditCard />,
    path: "/dashboard/transaksi",
  },

  {
    id: 5,
    name: "Rekapitulasi",
    icon: <ReceiptText />,
    path: "/dashboard/rekapitulasi",
  },

  {
    id: 6,
    name: "Data Pegawai",
    icon: <Users />,
    path: "/dashboard/data-pegawai",
  },
  {
    id: 7,
    name: "Data Transaksi",
    icon: <ArrowLeftRight />,
    path: "/dashboard/data-transaksi",
  },
];
