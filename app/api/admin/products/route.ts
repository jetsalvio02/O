import { database } from "@/lib/db";
import { product } from "@/lib/db/schema";
import { delete_file } from "@/lib/file";
import { prisma } from "@/lib/prisma";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  // const product = await prisma.product.create({ data: body });
  const insert_product = await database
    .insert(product)
    .values(body)
    .returning({ id: product.id });
  return NextResponse.json(insert_product);
}

export async function GET() {
  // const products = await prisma.product.findMany({
  //   orderBy: { created_at: "desc" },
  // });

  const products = await database
    .select()
    .from(product)
    .orderBy(desc(product.created_at));
  return NextResponse.json(products);
}

export async function PUT(request: Request) {
  const body = await request.json();

  const existing = await database
    .select()
    .from(product)
    .where(eq(product.id, body.id))
    .limit(1);

  const existing_product = existing[0];

  if (!existing_product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (
    body.image &&
    existing_product.image &&
    body.image !== existing_product.image
  ) {
    delete_file(existing_product.image);
  }

  // ✅ AWAIT the update
  const updated_product = await database
    .update(product)
    .set({
      name: body.name,
      price: body.price,
      stock: body.stock,
      image: body.image,
    })
    .where(eq(product.id, body.id))
    .returning();

  // ✅ Return plain data
  return NextResponse.json(updated_product[0]);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  // const product = await prisma.product.findUnique({ where: { id } });

  const existing = await database
    .select()
    .from(product)
    .where(eq(product.id, id));

  const select_product = existing[0];

  if (!select_product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (select_product.image) {
    delete_file(select_product.image);
  }

  // await prisma.product.delete({ where: { id } });

  await database.delete(product).where(eq(product.id, id));

  return NextResponse.json({ message: "Deleted!" });
}
