import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * Login page ko bhi ye layout wrap karega.
   *
   * Isliye pathname-based check server layout me directly
   * available nahi hai. Login ko public rakhne ke liye
   * hum route-group approach next change me use karenge.
   */
  return <>{children}</>;
}