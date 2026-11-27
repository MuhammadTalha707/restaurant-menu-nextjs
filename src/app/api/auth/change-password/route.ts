import { NextResponse } from "next/server";
import sql from "@/lib/db";
import {
  isAdminAuthenticated,
  getStoredAdminPassword,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword, confirmPassword } = await request.json();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New password and confirm password do not match." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
    }

    const storedPassword = await getStoredAdminPassword();
    if (!verifyPassword(oldPassword, storedPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const hashedNewPassword = hashPassword(newPassword);

    await sql`
      INSERT INTO admin_settings (id, password)
      VALUES (1, ${hashedNewPassword})
      ON CONFLICT (id) DO UPDATE SET password = ${hashedNewPassword}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}

