"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function ReportsCharts({ dailyOrders }: { dailyOrders: any[] }) {
  const labels = dailyOrders.map((d) => d.date).reverse();

  const salesData = dailyOrders.map((d) => Number(d.sales)).reverse();
  const orderCountData = dailyOrders.map((d) => Number(d.count)).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* BAR CHART */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Sales (₱)",
                data: salesData,
                backgroundColor: "#22c55e",
              },
            ],
          }}
        />
      </div>

      {/* LINE CHART */}
      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-lg font-semibold mb-4">Orders Trend</h3>
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Orders",
                data: orderCountData,
                borderColor: "#2563eb",
                backgroundColor: "#2563eb",
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
