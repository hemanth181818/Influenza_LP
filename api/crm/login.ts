/**
 * POST /api/crm/login
 * Body: { password: string }
 *
 * Checks the shared password (CRM_PASSWORD) and, on success, sets a signed
 * HttpOnly session cookie. There are no per-user accounts.
 */

import {
  createSession,
  jsonResponse,
  sessionCookie,
} from "../_lib/auth";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const password = process.env.CRM_PASSWORD;
  const secret = process.env.CRM_SESSION_SECRET;
  if (!password || !secret) {
    return jsonResponse(
      {
        ok: false,
        error: "Server not configured (CRM_PASSWORD / CRM_SESSION_SECRET).",
      },
      500
    );
  }

  let body: { password?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const supplied = typeof body.password === "string" ? body.password : "";
  if (!supplied || supplied !== password) {
    // Small delay to take the edge off brute-forcing.
    await new Promise((r) => setTimeout(r, 400));
    return jsonResponse({ ok: false, error: "Wrong password." }, 401);
  }

  const token = await createSession(secret);
  return jsonResponse({ ok: true }, 200, {
    "set-cookie": sessionCookie(token),
  });
}
