import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customer_name, phone, guests, booking_date } = await request.json();

    if (!customer_name || !phone || !guests) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO bookings (customer_name, phone, guests, booking_date)
      VALUES (${customer_name}, ${phone}, ${Number(guests)}, ${booking_date || 'Tonight'})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to book table' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, customer_name, phone, guests, booking_date } = await request.json();

    if (!id || !customer_name || !phone || !guests) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE bookings
      SET customer_name = ${customer_name},
          phone = ${phone},
          guests = ${Number(guests)},
          booking_date = ${booking_date || 'Tonight'}
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await sql`DELETE FROM bookings WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: 'Booking removed' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}

