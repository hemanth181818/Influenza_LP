/**
 * CRM session auth — shared by the /api/crm/* edge functions.
 *
 * A successful login mints an HMAC-signed session token that is stored in an
 * HttpOnly cookie. Every protected route verifies that token before touching
 * Airtable. There are no user accounts — a single shared password gates the
 * whole CRM (see CRM_PASSWORD). The signing key (CRM_SESSION_SECRET) makes the
 * cookie unforgeable.
 *
 * Files/dirs under api/ that start with "_" are NOT treated as routes by
 * Vercel, so this module is import-only.
 *
 * Env vars:
 *   CRM_PASSWORD        — the shared password used to log in
 *   CRM_SESSION_SECRET  — long random string used to sign session cookies
 */

export const SESSION_COOKIE = "crm_session";

// 7 days in seconds.
const SESSION_TTL = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(sig));
}

/** Constant-time-ish string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mint a signed session token. Payload is just an expiry timestamp. */
export async function createSession(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({ exp })));
  const sig = await sign(payload, secret);
  return `${payload}.${sig}`;
}

/** Verify a session token. Returns true only if signature + expiry are valid. */
export async function verifySession(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = await sign(payload, secret);
  if (!safeEqual(sig, expected)) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)));
    if (typeof data.exp !== "number") return false;
    return data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Read a cookie value out of the request's Cookie header. */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

/** Set-Cookie value for a fresh session. */
export function sessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL}`,
  ].join("; ");
}

/** Set-Cookie value that clears the session. */
export function clearCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

/**
 * Guard for protected routes. Resolves to null when the caller is authorised,
 * otherwise resolves to a 401 Response that the handler should return as-is.
 */
export async function requireAuth(req: Request): Promise<Response | null> {
  const secret = process.env.CRM_SESSION_SECRET;
  if (!secret) {
    return jsonResponse(
      { ok: false, error: "Server not configured (CRM_SESSION_SECRET)." },
      500
    );
  }
  const token = readCookie(req, SESSION_COOKIE);
  if (!(await verifySession(token, secret))) {
    return jsonResponse({ ok: false, error: "Not authenticated." }, 401);
  }
  return null;
}

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}
