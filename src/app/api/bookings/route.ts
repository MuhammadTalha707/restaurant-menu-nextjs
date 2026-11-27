import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    return NextResponse.json(bookings, { status: 200 });
  } catch (err) {
    console.error("GET bookings error:", err);
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customer_name, phone, guests, booking_date } = await request.json();
    if (!customer_name || !phone || !guests || !booking_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [created] = await sql`
      INSERT INTO bookings (customer_name, phone, guests, booking_date)
      VALUES (${customer_name}, ${phone}, ${Number(guests)}, ${booking_date})
      RETURNING *
    `;
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST bookings error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, customer_name, phone, guests, booking_date } = await request.json();
    if (!id || !customer_name || !phone || !guests || !booking_date) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE bookings
      SET customer_name = ${customer_name},
          phone = ${phone},
          guests = ${Number(guests)},
          booking_date = ${booking_date}
      WHERE id = ${Number(id)}
      RETURNING *
    `;
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PUT bookings error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await sql`DELETE FROM bookings WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE bookings error:", err);
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}

