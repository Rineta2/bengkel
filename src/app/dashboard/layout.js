"use client";

import { useAdmin } from "@/utlis/context/admin/read";
import { useAuth } from "@/utlis/context/AuthContext";
import { Fragment } from "react";
import Header from "@/components/UI/layout/Header";

export default function Dashboard({ children }) {
  const { user, isLoading: authIsLoading } = useAuth();

  // Ensure the admin data is fetched only if the user is available
  const { data, error, isLoading } = useAdmin({ uid: user?.uid });

  // Combine loading states for a cleaner check
  if (authIsLoading || isLoading) {
    return <h2>Loading ...</h2>;
  }

  // Differentiate between errors for better messaging
  if (error) {
    return <h2>Error fetching admin data: {error}</h2>;
  }

  if (!user) {
    return <h2>You need to log in to access this page.</h2>;
  }

  if (!data) {
    return <h2>You are not an admin or no admin data found.</h2>;
  }

  return (
    <Fragment>
      <Header />
      {children}
    </Fragment>
  );
}
