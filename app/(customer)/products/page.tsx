"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { ShoppingCart, Search } from "lucide-react";
import AuthModal from "@/app/(auth)/components/Auth_Modal";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

type SessionUser = {
  id: number;
};

/* ---------------- DEBOUNCE HOOK ---------------- */
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  /* 🔎 SEARCH */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  /* ---------------- FETCH PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        setProducts(data.filter((p: Product) => p.stock > 0));
      } catch {
        Swal.fire("Error", "Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };

    void fetchUser();
    void fetchProducts();
    router.prefetch("/cart");
  }, [router]);

  const getSessionUser = async () => {
    if (user?.id) return user;
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  /* ---------------- FILTERED PRODUCTS ---------------- */
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = async (product: Product) => {
    if (processingId) return;

    const sessionUser = await getSessionUser();
    if (!sessionUser?.id) {
      setShowAuth(true);
      return;
    }

    setProcessingId(product.id);

    try {
      await axios.post("/api/cart/add", {
        user_id: sessionUser.id,
        product_id: product.id,
      });

      window.dispatchEvent(new Event("cart_updated"));

      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: product.name,
        timer: 900,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Unable to add product", "error");
    } finally {
      setProcessingId(null);
    }
  };

  /* ---------------- BUY NOW ---------------- */
  const buyNow = async (product: Product) => {
    if (processingId) return;

    const sessionUser = await getSessionUser();
    if (!sessionUser?.id) {
      setShowAuth(true);
      return;
    }

    setProcessingId(product.id);

    try {
      await axios.post("/api/cart/buy_now", {
        user_id: sessionUser.id,
        product_id: product.id,
      });

      router.push("/cart");
    } catch {
      Swal.fire("Error", "Unable to process purchase", "error");
      setProcessingId(null);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <p className="text-gray-500">Loading products...</p>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        {/* 🔎 SEARCH INPUT */}
        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-6 gap-4">
        <h2 className="flex gap-2 items-center text-2xl font-bold">
          <ShoppingCart />
          <span>Products</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-4"
          >
            {/* Image */}
            <div className="bg-gray-100 rounded mb-3 overflow-hidden">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-auto rounded"
                />
              )}
            </div>

            {/* Info */}
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-gray-500 mb-1">
              ₱{p.price.toLocaleString("en-PH")}
            </p>

            <span className="inline-block text-xs px-2 py-1 rounded bg-green-100 text-green-700">
              In Stock
            </span>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                disabled={processingId === p.id}
                onClick={() => addToCart(p)}
                className={`flex-1 flex items-center justify-center gap-2
                  border border-blue-600 py-2 rounded
                  ${
                    processingId === p.id
                      ? "opacity-60 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
              >
                {processingId === p.id ? (
                  "Adding..."
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                disabled={processingId === p.id}
                onClick={() => buyNow(p)}
                className={`flex-1 py-2 rounded text-white
                  ${
                    processingId === p.id
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {processingId === p.id ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No products found
          </p>
        )}
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
