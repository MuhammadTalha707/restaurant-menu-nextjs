import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const items = await sql`SELECT * FROM menu_items ORDER BY id DESC`;
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, description } = await request.json();

    if (!name || !price || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newItem = await sql`
      INSERT INTO menu_items (name, price, description)
      VALUES (${name}, ${price}, ${description})
      RETURNING *
    `;

    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add menu item' }, { status: 500 });
  }
}

