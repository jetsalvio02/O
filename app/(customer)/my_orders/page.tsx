"use client";

import axios from "axios";
import { numeric } from "drizzle-orm/pg-core";
import { Logs } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function My_Orders_Page() {
  const [orders, set_orders] = useState<any[]>([]);
  const [user, set_user] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          set_user(null);
          return;
        }
        const data = await res.json();
        set_user(data);
      } catch {
        set_user(null);
      }
    };

    void loadUser();
  }, []);

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = async (uid: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders/${uid}`);
      set_orders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders(user.id);
  }, [user?.id]);

  /* ---------------- CANCEL ORDER ---------------- */
  const cancelOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: "Cancel order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.patch("/api/orders", {
        order_id: orderId,
        status: "CANCELLED",
      });

      await Swal.fire({
        title: "Order cancelled",
        text: "Your order has been successfully cancelled.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchOrders(user.id);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to cancel order", err);

      await Swal.fire({
        title: "Error",
        text: "Failed to cancel the order. Please try again.",
        icon: "error",
      });
    }
  };

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600";
      case "COMPLETED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
        <Logs />
        <span>My Orders</span>
      </h2>

      {/* ---------------- STATUS FILTER ---------------- */}
      <div className="flex mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="ALL">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading orders...</p>}

      {!loading && filteredOrders.length === 0 && (
        <p className="text-gray-500">No orders found</p>
      )}

      {/* ---------------- ORDER LIST ---------------- */}
      {[...filteredOrders].reverse().map((order) => (
        <div
          key={order.id}
          onClick={() => setSelectedOrder(order)}
          className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Order #{order.id}</span>
            <span
              className={`text-sm font-medium ${statusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <p className="text-sm text-gray-500">Total: ₱{order.total}</p>

          <p className="text-xs text-gray-400">
            {new Date(order.created_at).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Image preview */}
          <div className="flex gap-2 mt-3">
            {order.items?.slice(0, 3).map((item: any) => (
              <img
                key={item.id}
                src={item.product.image || "/placeholder.png"}
                className="w-12 h-12 rounded object-cover border"
              />
            ))}
            {order.items?.length > 3 && (
              <span className="text-xs text-gray-400 self-center">
                +{order.items.length - 3} more
              </span>
            )}
          </div>
        </div>
      ))}

      {/* ---------------- MODAL ---------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-1">
              Order #{selectedOrder.id}
            </h3>

            <p className="text-xs text-gray-400 mb-4">
              {new Date(selectedOrder.created_at).toLocaleString()}
            </p>

            {/* ITEMS */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {selectedOrder.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border rounded p-2"
                >
                  <img
                    src={item.product.image || "/placeholder.png"}
                    className="w-14 h-14 rounded object-cover border"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="border-t mt-4 pt-3 flex justify-between items-center">
              <span className="font-semibold">
                Total: ₱{selectedOrder.total}
              </span>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    selectedOrder.status === "PENDING"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {selectedOrder.status}
                </span>

                {selectedOrder.status === "PENDING" && (
                  <button
                    onClick={() => cancelOrder(selectedOrder.id)}
                    className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
