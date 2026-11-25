import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET: Fetch all menu items
export async function GET() {
  try {
    const result = await sql`SELECT * FROM menu_items ORDER BY id DESC`;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST: Add a new menu item
export async function POST(request: Request) {
  try {
    const { name, price, description } = await request.json();

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${Number(price)}, ${description || ''})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ error: 'Failed to add menu item' }, { status: 500 });
  }
}

// PUT: Edit/Update an existing menu item
export async function PUT(request: Request) {
  try {
    const { id, name, price, description } = await request.json();

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'ID, name, and price are required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE menu_items
      SET name = ${name}, price = ${Number(price)}, description = ${description || ''}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

// DELETE: Remove a menu item by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM menu_items WHERE id = ${id}`;
    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}

