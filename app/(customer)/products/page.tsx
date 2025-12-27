"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AuthModal from "@/app/(auth)/components/Auth_Modal";
import { addToCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import axios from "axios";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string | null;
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // const [user, set_user] = useState<any>(null);

  // useEffect(() => {
  //   const stored_user = localStorage.getItem("user");
  //   if (stored_user) set_user(JSON.parse(stored_user));
  // }, []);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.filter((p: Product) => p.stock > 0));
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------------- BUY NOW ---------------- */
  const buyNow = async (product: Product) => {
    const stored_user = localStorage.getItem("user");

    if (!stored_user) {
      setShowAuth(true);
      return;
    }

    const user = JSON.parse(stored_user);

    console.log(user.id);

    await axios.post("/api/cart/buy_now", {
      user_id: user.id,
      product_id: product.id,
    });

    router.push("/cart");
  };

  const add_to_cart = async (product: Product) => {
    const stored_user = localStorage.getItem("user");

    if (!stored_user) {
      setShowAuth(true);
      return;
    }

    const user = JSON.parse(stored_user);

    await axios.post("/api/cart/add", {
      user_id: user.id,
      product_id: product.id,
    });

    window.dispatchEvent(new Event("cart_updated"));

    Swal.fire({
      icon: "success",
      title: "Added to Cart",
      text: product.name,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return <p className="text-gray-500">Loading products...</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
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
                  // className="h-full w-full object-contain"
                  className="w-full h-auto rounded"
                />
              )}
            </div>

            {/* Info */}
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-gray-500 mb-1">
              ₱{p.price.toLocaleString("en-PH")}
            </p>

            <span
              className={`inline-block text-xs px-2 py-1 rounded ${
                p.stock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {p.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => add_to_cart(p)}
                className="flex-1 flex items-center justify-center gap-2 
               border border-blue-600 text-blue-600 
               py-2 rounded hover:bg-blue-50"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => buyNow(p)}
                className="flex-1 bg-blue-600 text-white 
               py-2 rounded hover:bg-blue-700"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No products available
          </p>
        )}
      </div>

      <AuthModal onClose={() => setShowAuth(false)} open={showAuth} />
    </>
  );
}
