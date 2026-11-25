import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, newPassword, confirmPassword } = await request.json();

    const validUser = process.env.ADMIN_USERNAME || "admin";

    if (!username || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (username !== validUser) {
      return NextResponse.json(
        { error: "Invalid Admin Username." },
        { status: 401 }
      );
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New Password and Confirm Password do not match." },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO admin_settings (id, password)
      VALUES (1, ${newPassword})
      ON CONFLICT (id) DO UPDATE SET password = ${newPassword}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Server error while updating password." },
      { status: 500 }
    );
  }
}

