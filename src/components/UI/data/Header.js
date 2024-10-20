import { House, Book, Bolt, Trello, UsersRound } from "lucide-react";

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
    name: "Jenis Barang",
    icon: <Bolt />,
    path: "/dashboard/jenis-barang",
  },

  {
    id: 4,
    name: "Merk Barang",
    icon: <Trello />,
    path: "/dashboard/merk-barang",
  },

  {
    id: 5,
    name: "Supplier",
    icon: <UsersRound />,
    path: "/dashboard/supplier",
  },
];
