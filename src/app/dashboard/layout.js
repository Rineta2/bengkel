"use client";

import { useAdmin } from "@/utlis/context/admin/read";

import { useAuth } from "@/utlis/context/AuthContext";

import { Fragment } from "react";

import Header from "@/components/UI/layout/Header";

export default function Dashboard({ children }) {
  const { user, isLoading: authIsLoading } = useAuth();
  const { data, error, isLoading } = useAdmin({ uid: user?.uid });

  if (authIsLoading || isLoading) {
    return <h2>Loading ...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  if (!data) {
    return <h2>You are not an admin or no data found.</h2>;
  }

  return (
    <Fragment>
      <Header />
      {children}
    </Fragment>
  );
}
