"use client";

import { Trash } from "lucide-react";
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
  const [err, setErr] = useState("");

  const [statusFilter, setStatusFilter] = useState<Order_Status | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<Order | null>(null);

  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message);
        setOrders(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load orders");
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
        o.user.email.toLowerCase().includes(s) ||
        o.phone.includes(s);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const updateStatus = async (orderId: number, newStatus: Order_Status) => {
    const prev = orders;
    setOrders((cur) =>
      cur.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSavingId(orderId);

    try {
      const res = await fetch("/api/admin/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      setOrders(prev);
      alert("Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  const deleteOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: "Delete order?",
      text: "Are you sure you want to permanently delete this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const prev = orders;
    setDeletingId(orderId);
    setOrders((cur) => cur.filter((o) => o.id !== orderId));

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      await Swal.fire({
        title: "Deleted!",
        text: "The order has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      setOrders(prev);

      await Swal.fire({
        title: "Error",
        text: "Failed to delete order.",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-gray-500">
            Monitor and process customer orders
          </p>
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, name, email, phone..."
            className="h-10 w-72 rounded-lg border px-3 text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 rounded-lg border px-3 text-sm"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Delivery</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">#{o.id}</td>

                  <td className="p-4">
                    <div className="font-medium">{o.user.name}</div>
                    <div className="text-xs text-gray-500">{o.user.email}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-xs">{o.phone}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {o.address}
                    </div>
                  </td>

                  <td className="p-4 font-medium">₱{o.total}</td>

                  <td className="p-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        stats_badge_class[o.status]
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelected(o)}
                        className="border rounded-lg px-3 py-2 text-xs"
                      >
                        View
                      </button>

                      <select
                        value={o.status}
                        disabled={savingId === o.id}
                        onChange={(e) =>
                          updateStatus(o.id, e.target.value as Order_Status)
                        }
                        className="border rounded-lg px-2 py-2 text-xs"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      <button
                        disabled={deletingId === o.id}
                        onClick={() => deleteOrder(o.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
