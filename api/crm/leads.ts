/**
 * GET /api/crm/leads
 *
 * Returns every lead with its pipeline state and activity log. Also doubles as
 * the auth probe the frontend uses on load: a 401 means "show the login form".
 */

import { jsonResponse, requireAuth } from "../_lib/auth";
import { getConfig, listLeads, STAGES } from "../_lib/airtable";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const unauth = await requireAuth(req);
  if (unauth) return unauth;

  try {
    const cfg = getConfig();
    const leads = await listLeads(cfg);
    return jsonResponse({ ok: true, leads, stages: STAGES });
  } catch (err) {
    console.error("crm/leads failed", err);
    return jsonResponse(
      { ok: false, error: "Could not load leads." },
      502
    );
  }
}
