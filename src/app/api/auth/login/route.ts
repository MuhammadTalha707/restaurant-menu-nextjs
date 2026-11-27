import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  getStoredAdminPassword,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const adminUser = process.env.ADMIN_USERNAME;

    if (!adminUser) {
      return NextResponse.json({ error: "Server auth not configured." }, { status: 500 });
    }

    const storedPassword = await getStoredAdminPassword();
    const validUser = username === adminUser;
    const validPass = verifyPassword(password || "", storedPassword);

    if (!validUser || !validPass) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = createSessionToken(username);
    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

