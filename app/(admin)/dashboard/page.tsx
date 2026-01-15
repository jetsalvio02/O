"use client";

import { useEffect, useState } from "react";
import DashboardCharts from "../components/Dashboard_Charts";

type DashboardData = {
  kpis: {
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_sales: number;
  };
  charts: {
    monthly_orders: any[];
    status_distribution: any[];
  };
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <p className="text-center text-red-500">Failed to load dashboard data</p>
    );
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
          value={`₱${kpis.total_sales.toLocaleString()}`}
          color="purple"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyOrders={charts.monthly_orders}
        statusDistribution={charts.status_distribution}
      />
    </>
  );
}

/* ---------------- KPI CARD ---------------- */
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

/* ---------------- SKELETON LOADER ---------------- */
function DashboardSkeleton() {
  return (
    <>
      {/* Title */}
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    </>
  );
}
