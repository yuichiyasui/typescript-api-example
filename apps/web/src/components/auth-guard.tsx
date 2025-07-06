"use client";

import { useGetUsersSelfQuery } from "@/__generated__/users/users";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const { data, isPending, error } = useGetUsersSelfQuery();

  if (error) {
    // Handle error, e.g., log it or show a message
    console.error("Error fetching user data:", error);
  }

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!data) {
    redirect("/sign-in");
  }

  return children;
};
