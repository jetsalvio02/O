"use client";

import Link from "next/link";
import { ShoppingCart, LogOut, User, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get_user, logout } from "@/lib/auth";
import AuthModal from "@/app/(auth)/components/Auth_Modal";
import Swal from "sweetalert2";
import { getCartCount } from "@/lib/cart";

export default function CustomerNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchCartCount = async () => {
    const user = get_user();
    if (!user?.id) {
      setCartCount(0);
      return;
    }

    const res = await fetch(`/api/cart/count?user_id=${user.id}`);
    const data = await res.json();
    setCartCount(data.count);
  };

  /* ======================
     INIT
  ====================== */
  useEffect(() => {
    setUser(get_user());

    fetchCartCount();

    const handler = () => {
      fetchCartCount();
    };

    window.addEventListener("cart_updated", handler);

    return () => {
      window.removeEventListener("cart_updated", handler);
    };
  }, []);

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    logout();
    setUser(null);
    setMobileOpen(false);

    await Swal.fire({
      icon: "success",
      title: "Logged out",
      timer: 1000,
      showConfirmButton: false,
    });

    router.push("/products");
  };

  /* ======================
     NAV LINKS (REUSABLE)
  ====================== */
  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex ${
        mobile ? "flex-col gap-4" : "items-center gap-6"
      } text-sm`}
    >
      <Link
        href="/products"
        onClick={() => setMobileOpen(false)}
        className="hover:text-blue-600"
      >
        Products
      </Link>

      {user && (
        <>
          <Link
            href="/my_orders"
            onClick={() => setMobileOpen(false)}
            className="hover:text-blue-600"
          >
            My Orders
          </Link>

          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="relative flex items-center gap-1"
          >
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </>
      )}

      {!user ? (
        <button
          onClick={() => {
            setShowAuth(true);
            setMobileOpen(false);
          }}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
        >
          <User size={18} />
          Login
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      )}
    </div>
  );

  /* ======================
     RENDER
  ====================== */
  return (
    <>
      <header className="bg-white border-b shadow-sm px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/products" className="font-bold text-blue-600 text-lg">
            Enterprise Ordering System
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex">
            <NavLinks />
          </nav>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4">
            <NavLinks mobile />
          </div>
        )}
      </header>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
