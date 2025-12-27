"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Swal from "sweetalert2";
import { CreditCard, ShoppingCart, TrashIcon } from "lucide-react";

type CartItem = {
  cartItemId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [address, setAddress] = useState("");

  /* ======================
     LOAD CART
  ====================== */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    axios
      .get(`/api/cart?user_id=${user.id}`)
      .then((res) => setCart(res.data))
      .catch(() => Swal.fire("Error", "Failed to load cart", "error"));
  }, []);

  /* ======================
     SELECT LOGIC
  ====================== */
  const toggleSelect = (cartItemId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cartItemId)
        ? prev.filter((id) => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((item) => item.cartItemId));
    }
  };

  const selectedItems = cart.filter((item) =>
    selectedIds.includes(item.cartItemId)
  );

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /* ======================
     QUANTITY HANDLERS
  ====================== */
  const updateQuantity = async (cartItemId: number, delta: number) => {
    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    if (newQty > item.stock) {
      Swal.fire("Stock limit reached", "", "warning");
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i
      )
    );

    await syncQuantity(cartItemId, newQty);
  };

  const setQuantity = async (cartItemId: number, value: number) => {
    if (isNaN(value) || value < 1) return;

    const item = cart.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    if (value > item.stock) {
      Swal.fire("Stock limit reached", "", "warning");
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: value } : i
      )
    );

    await syncQuantity(cartItemId, value);
  };

  /* ======================
     API SYNC
  ====================== */
  const syncQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await axios.patch("/api/cart/quantity", {
        cartItemId,
        quantity,
      });
    } catch {
      Swal.fire("Error", "Failed to update quantity", "error");
    }
  };

  /* ======================
     REMOVE ITEM
  ====================== */
  const removeItem = async (cartItemId: number) => {
    const res = await Swal.fire({
      title: "Remove item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Remove",
    });

    if (!res.isConfirmed) return;

    try {
      await axios.delete(`/api/cart/remove/${cartItemId}`);

      window.dispatchEvent(new Event("cart_updated"));

      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));

      setSelectedIds((prev) => prev.filter((id) => id !== cartItemId));
    } catch {
      Swal.fire("Error", "Failed to remove item", "error");
    }
  };

  /* ======================
     CHECKOUT SELECTED
  ====================== */
  const checkoutSelected = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id || selectedItems.length === 0) {
      Swal.fire("Select items", "Please select at least one item", "warning");
      return;
    }

    if (!address.trim()) {
      Swal.fire("Address required", "Please enter delivery address", "warning");
      return;
    }

    try {
      await axios.post("/api/orders", {
        user_id: user.id,
        address,
        items: selectedItems,
      });

      const remaining = cart.filter(
        (item) => !selectedIds.includes(item.cartItemId)
      );

      setCart(remaining);
      setSelectedIds([]);

      Swal.fire({
        icon: "success",
        title: "Order placed successfully",
        timer: 1200,
        showConfirmButton: false,
      });

      router.push("/my_orders");
    } catch {
      Swal.fire("Error", "Checkout failed", "error");
    }
  };

  /* ======================
     RENDER
  ====================== */
  if (cart.length === 0) {
    return <p className="text-gray-500">Your cart is empty</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* DELIVERY ADDRESS */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Delivery Address</h3>

        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          placeholder="House No., Street, Barangay, City / Municipality"
          className="w-full border rounded p-3 text-sm resize-none"
        />
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Your Cart <ShoppingCart />
        </h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selectedIds.length === cart.length}
            onChange={toggleSelectAll}
          />
          Select all
        </label>
      </div>

      {/* CART ITEMS */}
      {cart.map((item) => (
        <div
          key={item.cartItemId}
          className="bg-white p-4 rounded shadow mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          {/* CHECKBOX + IMAGE */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.cartItemId)}
              onChange={() => toggleSelect(item.cartItemId)}
            />

            <img
              src={item.image || "/placeholder.png"}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border"
            />
          </div>

          {/* INFO */}
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">₱{item.price}</p>
          </div>

          {/* QUANTITY */}
          <div className="flex items-center gap-2">
            <button
              disabled={item.quantity <= 1}
              onClick={() => updateQuantity(item.cartItemId, -1)}
              className="px-3 py-1 border rounded"
            >
              −
            </button>

            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(e) =>
                setQuantity(item.cartItemId, e.target.valueAsNumber)
              }
              className="w-16 text-center border rounded"
            />

            <button
              onClick={() => updateQuantity(item.cartItemId, 1)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>

          {/* SUBTOTAL + REMOVE */}
          <div className="flex flex-col items-end gap-2">
            <div className="font-semibold">₱{item.price * item.quantity}</div>

            <button
              onClick={() => removeItem(item.cartItemId)}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <TrashIcon size={14} />
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* CHECKOUT */}
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between font-semibold mb-2">
          <span>Selected Total</span>
          <span>₱{selectedTotal}</span>
        </div>

        <button
          disabled={selectedItems.length === 0}
          onClick={checkoutSelected}
          className="w-full bg-green-600 text-white py-3 rounded flex justify-center gap-2"
        >
          <CreditCard size={18} />
          Checkout Selected ({selectedItems.length})
        </button>

        <div className="mt-2 text-sm text-gray-500">Cart Total: ₱{total}</div>
      </div>
    </div>
  );
}
