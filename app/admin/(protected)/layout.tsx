import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session =
    await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  await connectDatabase();

  const admin =
    await Admin.findOne({
      _id: session.adminId,
      isActive: true,
    }).select("_id");

  if (!admin) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}