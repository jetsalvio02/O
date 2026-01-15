"use client";

import { useEffect, useState } from "react";
import ReportsCharts from "../components/Reports_Charts";

type ReportData = {
  total_sales: number;
  total_orders: number;
  daily_orders: {
    date: string;
    count: number;
    sales: number;
  }[];
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch("/api/admin/reports", {
          cache: "no-store",
        });
        const data = await res.json();
        setReport(data);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) {
    return <ReportsSkeleton />;
  }

  if (!report) {
    return <p className="text-center text-red-500">Failed to load reports</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SummaryCard
          label="Total Sales"
          value={`₱${report.total_sales.toLocaleString()}`}
          color="green"
        />
        <SummaryCard
          label="Completed Orders"
          value={report.total_orders}
          color="blue"
        />
      </div>

      {/* CHARTS */}
      <ReportsCharts dailyOrders={report.daily_orders} />

      {/* DAILY SALES TABLE */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">
          Daily Sales (Last 7 Days)
        </h3>

        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="text-left py-2">Date</th>
              <th className="text-left">Orders</th>
              <th className="text-left">Sales</th>
            </tr>
          </thead>
          <tbody>
            {report.daily_orders.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{row.date}</td>
                <td>{row.count}</td>
                <td>₱{row.sales.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------------- SUMMARY CARD ---------------- */
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "green" | "blue";
}) {
  const colors: Record<string, string> = {
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

/* ---------------- SKELETON LOADER ---------------- */
function ReportsSkeleton() {
  return (
    <>
      {/* Title */}
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-lg shadow p-5 mb-8">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between py-2 border-b">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}
