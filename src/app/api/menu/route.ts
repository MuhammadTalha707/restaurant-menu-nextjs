import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const items = await sql`SELECT * FROM menu_items ORDER BY id DESC`;
    return NextResponse.json(items, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized: Admin login required" }, { status: 401 });
  }
  try {
    const { name, price, description } = await request.json();
    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price required" }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${Number(price)}, ${description || ""})
      RETURNING *
    `;
    return NextResponse.json(result[0], { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add dish" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized: Admin login required" }, { status: 401 });
  }
  try {
    const { id, name, price, description } = await request.json();
    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: "ID, name and price required" }, { status: 400 });
    }
    const result = await sql`
      UPDATE menu_items
      SET name = ${name}, price = ${Number(price)}, description = ${description || ""}
      WHERE id = ${Number(id)}
      RETURNING *
    `;
    return NextResponse.json(result[0], { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update dish" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized: Admin login required" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await sql`DELETE FROM menu_items WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 });
  }
}

