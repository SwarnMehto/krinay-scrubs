import { getAdminSession } from "@/lib/admin-auth";
import { connectDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  await connectDatabase();

  const admin = await Admin.findOne({
    _id: session.adminId,
    isActive: true,
  });

  if (!admin) {
    return null;
  }

  return {
    session,
    admin,
  };
}