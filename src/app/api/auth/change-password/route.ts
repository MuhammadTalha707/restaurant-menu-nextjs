import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { isAdminAuthenticated, getActiveAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();
    const activePass = await getActiveAdminPassword();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Please fill in both fields." }, { status: 400 });
    }

    if (oldPassword !== activePass) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: "New password must be at least 4 characters." }, { status: 400 });
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

