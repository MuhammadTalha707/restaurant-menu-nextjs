import crypto from "crypto";
import { cookies } from "next/headers";
import sql from "@/lib/db";

const COOKIE_NAME = "spice_admin_session";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET environment variable is missing or too short.");
  }
  return secret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored.includes(":")) {
    // Backward compatibility if initial password was plain text before first change
    return password === stored;
  }
  const [salt, key] = stored.split(":");
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (hashBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

export async function getStoredAdminPassword(): Promise<string> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT PRIMARY KEY,
        password TEXT NOT NULL
      )
    `;
    const rows = await sql`SELECT password FROM admin_settings WHERE id = 1`;
    if (rows.length > 0 && rows[0].password) {
      return rows[0].password as string;
    }
  } catch (err) {
    console.error("Failed to fetch admin password from DB:", err);
  }

  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) {
    throw new Error("ADMIN_PASSWORD environment variable is not set.");
  }
  return hashPassword(envPass);
}

export function createSessionToken(username: string): string {
  const secret = getSecret();
  const payload = `${username}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const secret = getSecret();
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return false;
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sig.length !== expectedSig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export { COOKIE_NAME };

