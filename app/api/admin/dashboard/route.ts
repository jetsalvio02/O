// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

import { database } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// export async function GET() {
//   // KPIs
//   const total_orders = await prisma.order.count();
//   const pending_orders = await prisma.order.count({
//     where: { status: "PENDING" },
//   });
//   const completed_orders = await prisma.order.count({
//     where: { status: "COMPLETED" },
//   });

//   const total_sales_agg = await prisma.order.aggregate({
//     _sum: { total: true },
//     where: { status: "COMPLETED" },
//   });

//   const monthly = await prisma.$queryRaw<{ month: string; orders: number }[]>`
//   SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as orders FROM \`Order\` WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
//   GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY MIN(created_at)`;

//   const status_count = await prisma.order.groupBy({
//     by: ["status"],
//     _count: { status: true },
//   });

//   return NextResponse.json({
//     kpis: {
//       total_orders,
//       pending_orders,
//       completed_orders,
//       total_sales: total_sales_agg._sum.total ?? 0,
//     },
//     charts: {
//       monthly_orders: monthly.map((month) => ({
//         month: month.month,
//         orders: Number(month.orders),
//       })),
//       status_distribution: status_count.map((stats) => ({
//         status: stats.status,
//         count: Number(stats._count.status),
//       })),
//     },
//   });
// }

export async function GET() {
  const [{ count: total_orders }] = await database
    .select({ count: sql<number>`count(*)` })
    .from(orders);

  const [{ count: pending_orders }] = await database
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "PENDING"));

  const [{ count: completed_orders }] = await database
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  const [{ total_sales }] = await database
    .select({
      total_sales: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  const monthly = await database.execute<{
    month: string;
    orders: number;
  }>(sql`
    SELECT
      TO_CHAR(created_at, 'Mon') AS month,
      COUNT(*)::int AS orders
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY
      TO_CHAR(created_at, 'YYYY-MM'),
      TO_CHAR(created_at, 'Mon')
    ORDER BY MIN(created_at)
  `);

  const status_count = await database
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

  return NextResponse.json({
    kpis: {
      total_orders,
      pending_orders,
      completed_orders,
      total_sales,
    },
    charts: {
      monthly_orders: monthly.rows.map((m) => ({
        month: m.month,
        orders: Number(m.orders),
      })),
      status_distribution: status_count.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
    },
  });
}
