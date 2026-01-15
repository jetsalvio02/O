import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { type InferModel } from "drizzle-orm";
import {
  carts,
  carts_items,
  orders_items,
  orders as ordersTable,
  product,
  users,
} from "@/lib/db/schema";
import { database } from "@/lib/db";

export async function GET() {
  // const orders = await prisma.order.findMany({
  //   include: {
  //     user: true,
  //     items: {
  //       include: { product: true },
  //     },
  //   },
  //   orderBy: { created_at: "desc" },
  // });
  // return NextResponse.json(orders);
  const rows = await database
    .select({
      order: ordersTable,
      user: users,
      item: orders_items,
      product: product,
    })
    .from(ordersTable)
    .leftJoin(users, eq(users.id, ordersTable.user_id))
    .leftJoin(orders_items, eq(orders_items.order_id, ordersTable.id))
    .leftJoin(product, eq(product.id, orders_items.product_id))
    .orderBy(desc(ordersTable.created_at));

  const ordersMap = new Map<number, any>();

  for (const row of rows) {
    const orderId = row.order.id;

    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        ...row.order,
        user: row.user,
        items: [],
      });
    }

    if (row.item && row.product) {
      ordersMap.get(orderId).items.push({
        ...row.item,
        product: row.product,
      });
    }
  }

  return NextResponse.json(Array.from(ordersMap.values()));
}

export async function PATCH(request: Request) {
  const { order_id, status } = await request.json();

  // const order = await prisma.order.update({
  //   where: { id: order_id },
  //   data: { status },
  // });

  // return NextResponse.json(order);

  const updatedOrder = (
    await database
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, order_id))
      .returning()
  )[0];

  if (!updatedOrder) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(updatedOrder);
}

// export async function POST(req: Request) {
//   try {
//     const { user_id, items } = await req.json();

//     if (!user_id || !items || items.length === 0) {
//       return NextResponse.json(
//         { message: "Invalid order data" },
//         { status: 400 }
//       );
//     }

//     // 1. Fetch products involved
//     const productIds = items.map((i: any) => i.productId);

//     const products = await prisma.product.findMany({
//       where: { id: { in: productIds } },
//     });

//     // 2. Stock validation
//     for (const item of items) {
//       const product = products.find((p) => p.id === item.productId);

//       if (!product) {
//         return NextResponse.json(
//           { message: "Product not found" },
//           { status: 404 }
//         );
//       }

//       if (product.stock < item.quantity) {
//         return NextResponse.json(
//           { message: `Insufficient stock for ${product.name}` },
//           { status: 400 }
//         );
//       }
//     }

//     // 3. Transaction (ORDER + STOCK UPDATE)
//     const result = await prisma.$transaction(async (tx) => {
//       const order = await tx.order.create({
//         data: {
//           user_id: user_id,
//           status: "PENDING",
//           total: items.reduce(
//             (sum: number, i: any) => sum + i.price * i.quantity,
//             0
//           ),
//           items: {
//             create: items.map((i: any) => ({
//               product_id: i.productId,
//               quantity: i.quantity,
//               price: i.price,
//             })),
//           },
//         },
//       });

//       // Deduct stock
//       for (const item of items) {
//         await tx.product.update({
//           where: { id: item.productId },
//           data: {
//             stock: {
//               decrement: item.quantity,
//             },
//           },
//         });
//       }

//       return order;
//     });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Order failed" }, { status: 500 });
//   }
// }
// export async function POST(req: Request) {
//   try {
//     const { user_id, items } = await req.json();

//     if (!user_id || !items?.length) {
//       return NextResponse.json(
//         { message: "Invalid order data" },
//         { status: 400 }
//       );
//     }

//     // 1. Load user address
//     const [user] = await database
//       .select()
//       .from(users)
//       .where(eq(users.id, user_id));

//     if (!user?.address || !user?.phone) {
//       return NextResponse.json({ message: "Address not set" }, { status: 400 });
//     }

//     // 2. Load products
//     const productIds = items.map((i: any) => i.productId);

//     const dbProducts = await database
//       .select()
//       .from(product)
//       .where(inArray(product.id, productIds));

//     // 3. Validate stock
//     for (const item of items) {
//       const p = dbProducts.find((p) => p.id === item.productId);
//       if (!p || p.stock < item.quantity) {
//         return NextResponse.json(
//           { message: `Insufficient stock for ${item.productId}` },
//           { status: 400 }
//         );
//       }
//     }

//     type OrderInsert = InferModel<typeof ordersTable, "insert">;

//     const orderData: OrderInsert = {
//       user_id: user_id,
//       address: user.address,
//       phone: user.phone,
//       status: "PENDING",
//       total: items.reduce(
//         (sum: number, i: any) => sum + i.price * i.quantity,
//         0
//       ),
//     };

//     // 4. TRANSACTION (THIS IS CRITICAL)
//     const result = await database.transaction(async (tx) => {
//       // create order
//       const [order] = await tx
//         .insert(ordersTable)
//         .values(orderData)
//         .returning();

//       // create order items
//       await tx.insert(orders_items).values(
//         items.map((i: any) => ({
//           order_id: order.id,
//           product_id: i.productId,
//           quantity: i.quantity,
//           price: i.price,
//         }))
//       );

//       // update stock
//       for (const item of items) {
//         await tx
//           .update(product)
//           .set({
//             stock: sql`${product.stock} - ${item.quantity}`,
//           })
//           .where(eq(product.id, item.productId));
//       }

//       // 🔥 DELETE CART ITEMS (THIS FIXES YOUR ISSUE)
//       await tx.delete(carts).where(
//         inArray(
//           carts.id,
//           items.map((i: any) => i.cartItemId)
//         )
//       );

//       return order;
//     });

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Order failed" }, { status: 500 });
//   }
// }

export async function POST(req: Request) {
  try {
    const { user_id, items } = await req.json();

    if (!user_id || !items?.length) {
      return NextResponse.json(
        { message: "Invalid order data" },
        { status: 400 }
      );
    }

    // 1. Load user address and phone
    const [user] = await database
      .select()
      .from(users)
      .where(eq(users.id, user_id));

    if (!user?.address || !user?.phone) {
      return NextResponse.json({ message: "Address not set" }, { status: 400 });
    }

    // 2. Load products
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await database
      .select()
      .from(product)
      .where(inArray(product.id, productIds));

    // 3. Validate stock
    for (const item of items) {
      const p = dbProducts.find((p) => p.id === item.productId);
      if (!p) {
        return NextResponse.json(
          { message: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${p.name}` },
          { status: 400 }
        );
      }
    }

    // 4. Create order
    const [order] = await database
      .insert(ordersTable)
      .values({
        user_id: user.id,
        address: user.address,
        phone: user.phone,
        status: "PENDING",
        total: items.reduce(
          (sum: number, i: any) => sum + i.price * i.quantity,
          0
        ),
      })
      .returning();

    // 5. Insert order items
    await database.insert(orders_items).values(
      items.map((i: any) => ({
        order_id: order.id,
        product_id: i.productId,
        quantity: i.quantity,
        price: i.price,
      }))
    );

    // 6. Deduct stock
    for (const item of items) {
      await database
        .update(product)
        .set({ stock: sql`${product.stock} - ${item.quantity}` })
        .where(eq(product.id, item.productId));
    }

    // 7. Delete cart items
    await database.delete(carts_items).where(
      inArray(
        carts_items.id,
        items.map((i: any) => i.cartItemId)
      )
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ message: "Order failed" }, { status: 500 });
  }
}
