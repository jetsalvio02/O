"use client";

import { useEffect, useState } from "react";
import ReportsCharts from "../components/Reports_Charts";

export default function AdminReportsPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => setReport(data));
  }, []);

  if (!report) {
    return <p>Loading reports...</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{report.totalSales}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-500">Completed Orders</p>
          <p className="text-2xl font-bold text-blue-600">
            {report.totalOrders}
          </p>
        </div>
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
            {report.daily_orders.map((row: any, index: number) => (
              <tr key={index} className="border-b">
                <td className="py-2">{row.date}</td>
                <td>{row.count}</td>
                <td>₱{row.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
