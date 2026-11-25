import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { username, recoveryKey, newPassword } = await request.json();

    const validUser = process.env.ADMIN_USERNAME || "admin";
    const validSecret = process.env.SESSION_SECRET || "spice_bite_secret_fallback_key";

    if (!username || !recoveryKey || !newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "All fields are required and new password must be at least 4 characters." },
        { status: 400 }
      );
    }

    if (username !== validUser || recoveryKey !== validSecret) {
      return NextResponse.json(
        { error: "Invalid Admin Username or Master Recovery Key." },
        { status: 401 }
      );
    }

    await sql`
      INSERT INTO admin_settings (id, password)
      VALUES (1, ${newPassword})
      ON CONFLICT (id) DO UPDATE SET password = ${newPassword}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}

