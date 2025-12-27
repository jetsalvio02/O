"use client";

import { useEffect, useMemo, useState } from "react";

type Order_Status = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type Order_Item = {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; price: number; image?: string | null };
};

type Order = {
  id: number;
  status: Order_Status;
  total: number;
  created_at: string;
  user: { id: number; name: string; email: string };
  items: Order_Item[];
};

const stats_badge_class: Record<Order_Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 boarder-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-700 boarder-blue-200",
  COMPLETED: "bg-green-100 text-green-700 boarder-green-200",
  CANCELLED: "bg-red-100 text-red-700 boarder-red-200",
};

export default function Admin_Order_Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // filters
  const [statusFilter, setStatusFilter] = useState<Order_Status | "ALL">("ALL");
  const [search, setSearch] = useState("");

  // modal
  const [selected, setSelected] = useState<Order | null>(null);

  // UX: optimistic status update
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load orders");
        setOrders(data);
      } catch (e: any) {
        setErr(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "ALL" ? true : o.status === statusFilter;
      const matchSearch =
        !s ||
        String(o.id).includes(s) ||
        o.user.name.toLowerCase().includes(s) ||
        o.user.email.toLowerCase().includes(s);
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (orderId: number, newStatus: Order_Status) => {
    // optimistic update
    const prev = orders;
    setOrders((cur) =>
      cur.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSavingId(orderId);

    try {
      const res = await fetch("/api/admin/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update status");
    } catch (e: any) {
      // rollback on error
      setOrders(prev);
      alert(e?.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-500">
            Monitor and process customer orders
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email..."
            className="h-10 w-full sm:w-72 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
          Loading orders...
        </div>
      )}

      {!loading && err && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-sm text-gray-600 mt-1">{err}</p>
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
          No orders found.
        </div>
      )}

      {/* Table */}
      {!loading && !err && filtered.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b text-gray-600">
                <tr>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      #{o.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">
                        {o.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(o.created_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      ₱{o.total}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                          stats_badge_class[o.status]
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          View
                        </button>

                        <select
                          value={o.status}
                          disabled={savingId === o.id}
                          onChange={(e) =>
                            updateStatus(o.id, e.target.value as Order_Status)
                          }
                          className="rounded-lg border bg-white px-2 py-2 text-xs outline-none disabled:opacity-60"
                          title="Update status"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-semibold">Order #{selected.id}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-gray-800">
                  {selected.user.name}
                </p>
                <p className="text-sm text-gray-600">{selected.user.email}</p>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="space-y-2">
                  {selected.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      {/* Product Image */}
                      <img
                        src={it.product.image || "/placeholder.png"}
                        alt={it.product.name}
                        className="h-14 w-14 rounded-lg object-cover border"
                      />

                      {/* Product Info */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {it.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {it.quantity} • Price: ₱{Number(it.price)}
                        </p>
                      </div>

                      {/* Item Total */}
                      <p className="font-semibold text-gray-800">
                        ₱{Number(it.price) * it.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-gray-800">
                  ₱{selected.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
