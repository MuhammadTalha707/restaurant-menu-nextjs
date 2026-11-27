# Spice & Flame — Dynamic Restaurant Menu & Reservation System

Full-stack Next.js (App Router) restaurant web application connected to Neon PostgreSQL with secure admin authentication, scrypt password hashing, server-side route protection, and full CRUD for menu items and table reservations.

## Environment Variables
Add these to `.env.local` and Vercel Project Settings:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `ADMIN_USERNAME` — Admin username
- `ADMIN_PASSWORD` — Initial admin password
- `SESSION_SECRET` — Random secret string (minimum 32 characters)

## Database Schema (PostgreSQL / Neon)
```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  guests INT NOT NULL,
  booking_date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id INT PRIMARY KEY,
  password TEXT NOT NULL
);

