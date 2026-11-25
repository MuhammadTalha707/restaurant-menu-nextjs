import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { getActiveAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, currentPassword, newPassword, confirmPassword } = await request.json();

    const validUser = process.env.ADMIN_USERNAME || "admin";
    const activePass = await getActiveAdminPassword();

    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
    }

    if (username !== validUser || currentPassword !== activePass) {
      return NextResponse.json({ error: "Invalid Username or Current Password." }, { status: 401 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: "New password must be at least 4 characters." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New Password and Confirm Password do not match." }, { status: 400 });
    }

    await sql`
      INSERT INTO admin_settings (id, password)
      VALUES (1, ${newPassword})
      ON CONFLICT (id) DO UPDATE SET password = ${newPassword}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}

