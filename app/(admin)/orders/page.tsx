"use client";

import { Trash, X, ImageIcon, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

type Order_Status = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type Order_Item = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
  };
};

type Order = {
  id: number;
  status: Order_Status;
  total: number;
  created_at: string;
  address: string;
  phone: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: Order_Item[];
};

const stats_badge_class: Record<Order_Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function Admin_Order_Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  const [statusFilter, setStatusFilter] = useState<Order_Status | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return orders.filter((o) => {
      return (
        (statusFilter === "ALL" || o.status === statusFilter) &&
        (!s ||
          o.user.name.toLowerCase().includes(s) ||
          o.user.email.toLowerCase().includes(s) ||
          String(o.id).includes(s))
      );
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (id: number, status: Order_Status) => {
    const prev = orders;
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    setSavingId(id);

    try {
      const res = await fetch("/api/admin/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: id, status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOrders(prev);
    } finally {
      setSavingId(null);
    }
  };

  const deleteOrder = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const prev = orders;
    setOrders((o) => o.filter((x) => x.id !== id));
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setOrders(prev);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Orders
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Order_Status | "ALL")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {!loading && (
          <>
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Order
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-gray-900">#{o.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {o.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {o.user.email}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        ₱{o.total}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                            stats_badge_class[o.status]
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="px-3 py-1 rounded text-xs font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>

                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            updateStatus(o.id, e.target.value as Order_Status)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option>PENDING</option>
                          <option>PROCESSING</option>
                          <option>COMPLETED</option>
                          <option>CANCELLED</option>
                        </select>

                        <button
                          disabled={deletingId === o.id}
                          onClick={() => deleteOrder(o.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash size={14} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{o.id}
                      </h3>
                      <p className="text-sm text-gray-600">{o.user.name}</p>
                      <p className="text-xs text-gray-500">{o.user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${
                        stats_badge_class[o.status]
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₱{o.total}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
                    <button
                      onClick={() => setSelected(o)}
                      className="w-full px-3 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-gray-900"
                    >
                      View Details
                    </button>

                    <div className="flex gap-2">
                      <select
                        value={o.status}
                        disabled={savingId === o.id}
                        onChange={(e) =>
                          updateStatus(o.id, e.target.value as Order_Status)
                        }
                        className="flex-1 border border-gray-300 rounded px-2 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option>PENDING</option>
                        <option>PROCESSING</option>
                        <option>COMPLETED</option>
                        <option>CANCELLED</option>
                      </select>

                      <button
                        disabled={deletingId === o.id}
                        onClick={() => deleteOrder(o.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 text-sm md:text-base">
                  No orders found
                </p>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-sm md:text-base">
              Loading orders...
            </p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md md:max-w-xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex justify-between items-center p-4 md:p-5 border-b bg-white">
              <h3 className="font-semibold text-gray-900 text-lg md:text-xl">
                Order #{selected.id}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-4 md:space-y-5 text-sm md:text-base">
              {/* CUSTOMER */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">Customer</p>
                <p className="text-gray-900">{selected.user.name}</p>
                <p className="text-gray-600 text-sm">{selected.user.email}</p>
              </div>

              {/* DELIVERY */}
              <div>
                <p className="font-semibold text-gray-900 mb-1">Delivery</p>
                <p className="text-gray-900">{selected.phone}</p>
                <p className="text-gray-600 text-sm break-words">
                  {selected.address}
                </p>
              </div>

              {/* ITEMS */}
              <div>
                <p className="font-semibold text-gray-900 mb-3">Items</p>

                <div className="space-y-2 md:space-y-3">
                  {selected.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center border border-gray-200 rounded-lg p-3"
                    >
                      {/* IMAGE */}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                        )}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">
                          ₱{item.product.price} × {item.quantity}
                        </p>
                      </div>

                      {/* PRICE */}
                      <div className="font-semibold text-gray-900 text-right flex-shrink-0">
                        ₱{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-gray-200 pt-4 md:pt-5 flex justify-between font-bold text-base md:text-lg text-gray-900">
                <span>Total</span>
                <span>₱{selected.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
