"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Define color mapping per status
const STATUS_COLORS: Record<string, string> = {
  pending: "#facc15", // yellow
  processing: "#3b82f6", // blue
  completed: "#22c55e", // green
  cancelled: "#ef4444", // red
};

type MonthlyOrder = {
  month: string;
  orders: number;
};

type StatusDistribution = {
  status: string;
  count: number;
};

interface DashboardChartsProps {
  monthlyOrders: MonthlyOrder[];
  statusDistribution: StatusDistribution[];
}

export default function DashboardCharts({
  monthlyOrders,
  statusDistribution,
}: DashboardChartsProps) {
  // Bar chart data
  const barData = {
    labels: monthlyOrders.map((m) => m.month),
    datasets: [
      {
        label: "Orders",
        data: monthlyOrders.map((m) => m.orders),
        backgroundColor: "#2563eb", // Tailwind blue
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
      },
    },
  };

  // Doughnut chart data with dynamic colors based on status
  const doughnutData = {
    labels: statusDistribution.map((s) => s.status),
    datasets: [
      {
        data: statusDistribution.map((s) => s.count),
        backgroundColor: statusDistribution.map(
          (s) => STATUS_COLORS[s.status.toLowerCase()] || "#9ca3af" // default gray if unknown
        ),
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Orders (Last 6 Months)</h3>
        <Bar data={barData} options={barOptions} />
      </div>

      {/* Doughnut Chart */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </div>
  );
}
