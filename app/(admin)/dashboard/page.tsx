"use client";

import { useEffect, useState } from "react";
import DashboardCharts from "../components/Dashboard_Charts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((result) => setData(result));
  }, []);

  if (!data) {
    return <p>Loading dashboard...</p>;
  }

  const { kpis, charts } = data;

  return (
    <>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of system activity</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Orders"
          value={kpis.total_orders}
          color="blue"
        />
        <DashboardCard
          title="Pending Orders"
          value={kpis.pending_orders}
          color="yellow"
        />
        <DashboardCard
          title="Completed Orders"
          value={kpis.completed_orders}
          color="green"
        />
        <DashboardCard
          title="Total Sales"
          value={`₱${kpis.total_sales}`}
          color="purple"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyOrders={charts.monthly_orders}
        statusDistribution={charts.status_distribution}
      />

      {/* RECENT ORDERS (STATIC FOR NOW – OK) */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="text-left py-2">Order ID</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Status</th>
              <th className="text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">#1001</td>
              <td>Juan Dela Cruz</td>
              <td className="text-yellow-600 font-medium">Pending</td>
              <td>₱500</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">#1002</td>
              <td>Maria Santos</td>
              <td className="text-green-600 font-medium">Completed</td>
              <td>₱320</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/* KPI CARD COMPONENT */
function DashboardCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
