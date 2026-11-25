import { NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, getActiveAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const validUser = process.env.ADMIN_USERNAME || "admin";
    const validPass = await getActiveAdminPassword();

    if (username !== validUser || password !== validPass) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = createSessionToken(validUser);
    const res = NextResponse.json({ success: true }, { status: 200 });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

