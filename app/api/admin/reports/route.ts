import { database } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { prisma } from "@/lib/prisma";
import { sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  // const total_sales = await prisma.order.aggregate({
  //   _sum: { total: true },
  //   where: { status: "COMPLETED" },
  // });

  // const total_orders = await prisma.order.count({
  //   where: { status: "COMPLETED" },
  // });

  // const daily_orders =
  //   await prisma.$queryRaw`SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total) as sales FROM \`Order\` WHERE status = 'COMPLETED'
  //   GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 7`;

  const totalSalesResult = await database
    .select({
      total: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  const total_sales = totalSalesResult[0].total;

  const totalOrdersResult = await database
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"));

  const total_orders = totalOrdersResult[0].count;

  const daily_orders = await database
    .select({
      date: sql<string>`DATE(${orders.created_at})`,
      count: sql<number>`COUNT(*)`,
      sales: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "COMPLETED"))
    .groupBy(sql`DATE(${orders.created_at})`)
    .orderBy(sql`DATE(${orders.created_at}) DESC`)
    .limit(7);

  return NextResponse.json({
    // total_sales: total_sales._sum.total ?? 0,
    total_sales,
    total_orders,
    daily_orders,
  });
}
