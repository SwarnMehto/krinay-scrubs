"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/auth/logout",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "[ADMIN_LOGOUT_ERROR]",
        error,
      );

      alert(
        "Unable to logout. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-[#922424] bg-white px-4 py-2 text-sm font-semibold text-[#922424] transition hover:bg-[#922424] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Signing out..."
        : "Logout"}
    </button>
  );
}