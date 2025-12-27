import path from "path";
import { v4 as uuid } from "uuid";
import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.formData();
  const file = data.get("image") as File;

  if (!file) {
    return NextResponse.json({ message: "No image uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${uuid()}-${file.name}`;
  const filepath = path.join(
    process.cwd(),
    "public/uploads/products",
    filename
  );

  await writeFile(filepath, buffer);

  return NextResponse.json({
    path: `/uploads/products/${filename}`,
  });
}
