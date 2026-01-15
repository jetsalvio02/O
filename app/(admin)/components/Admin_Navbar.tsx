"use client";

import { BookUser, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { logout } from "@/lib/auth";

export default function AdminNavbar() {
  const router = useRouter();

  const handle_logout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    await logout();
    router.push("/products");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b shadow-sm px-6 flex items-center justify-between">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <BookUser size={23} /> Admin Dashboard
      </h1>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <User size={18} />
          <span>Admin</span>
        </div>

        <button
          onClick={handle_logout}
          className="flex items-center gap-1 text-red-500 hover:underline"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
