"use client";

import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();

  if (user && !user.isAdmin) {
    redirect("/");
  }

  return children
}
