/**
 * POST /api/crm/logout — clears the session cookie.
 */

import { clearCookie, jsonResponse } from "../_lib/auth";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  return jsonResponse({ ok: true }, 200, { "set-cookie": clearCookie() });
}
