"use client";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function DashboardCharts({
  monthlyOrders,
  statusDistribution,
}: {
  monthlyOrders: { month: string; orders: number }[];
  statusDistribution: { status: string; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Orders (Last 6 Months)</h3>
        <Bar
          data={{
            labels: monthlyOrders.map((m) => m.month),
            datasets: [
              {
                label: "Orders",
                data: monthlyOrders.map((m) => m.orders),
                backgroundColor: "#2563eb",
              },
            ],
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
        <Doughnut
          data={{
            labels: statusDistribution.map((s) => s.status),
            datasets: [
              {
                data: statusDistribution.map((s) => s.count),
                backgroundColor: ["#facc15", "#3b82f6", "#22c55e", "#ef4444"],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
