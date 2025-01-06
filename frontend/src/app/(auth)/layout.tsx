"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      redirect("/home");
    }
  }, []);

  return children;
}
