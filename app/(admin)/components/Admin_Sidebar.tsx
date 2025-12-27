"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin_products", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <nav className="p-4 space-y-1">
      {menu.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
              ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded shadow"
      >
        <Menu size={22} />
      </button>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:flex-col w-64 fixed inset-y-0 left-0 bg-white border-r shadow-lg z-30">
        <div className="h-16 flex items-center px-6 border-b font-bold text-blue-600">
          Ordering System
        </div>
        <SidebarContent />
      </aside>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:hidden`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <span className="font-bold text-blue-600">Ordering System</span>
          <button onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
