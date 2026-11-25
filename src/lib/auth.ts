import crypto from "crypto";
import { cookies } from "next/headers";
import sql from "@/lib/db";

export const COOKIE_NAME = "spice_admin_session";

function getSecret() {
  return process.env.SESSION_SECRET || "spice_bite_secret_fallback_key";
}

export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token?: string): string | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", getSecret()).update(encoded).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (data.exp < Date.now()) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(verifySessionToken(token));
}

export async function getActiveAdminPassword(): Promise<string> {
  const envPass = process.env.ADMIN_PASSWORD || "spice123";
  try {
    const rows = await sql`SELECT password FROM admin_settings WHERE id = 1`;
    if (rows.length > 0 && rows[0].password) return rows[0].password;
  } catch {
    // Fallback to .env password
  }
  return envPass;
}

