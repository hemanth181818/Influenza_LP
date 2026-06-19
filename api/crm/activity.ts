/**
 * POST /api/crm/activity
 * Body: { id: string, type: "Call"|"Note"|"Email", note: string,
 *         outcome?: string, by?: string, stage?: Stage }
 *
 * Appends a call/note/email entry to a lead's activity log. Call/Email entries
 * also bump "Last Contacted". An optional stage moves the lead at the same time
 * (e.g. logging a call and advancing to "Call Done").
 */

import { jsonResponse, requireAuth } from "../_lib/auth";
import {
  addActivity,
  getConfig,
  STAGES,
  type ActivityType,
  type Stage,
} from "../_lib/airtable";

export const config = { runtime: "edge" };

const TYPES: ActivityType[] = ["Call", "Note", "Email"];

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const unauth = await requireAuth(req);
  if (unauth) return unauth;

  let body: {
    id?: unknown;
    type?: unknown;
    note?: unknown;
    outcome?: unknown;
    by?: unknown;
    stage?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return jsonResponse({ ok: false, error: "Missing lead id." }, 400);

  const type = TYPES.find((t) => t === body.type);
  if (!type) {
    return jsonResponse({ ok: false, error: "Invalid activity type." }, 400);
  }

  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 5000) : "";
  const outcome =
    typeof body.outcome === "string"
      ? body.outcome.trim().slice(0, 200)
      : undefined;
  const by =
    typeof body.by === "string" ? body.by.trim().slice(0, 80) : undefined;

  if (!note && !outcome) {
    return jsonResponse(
      { ok: false, error: "Add a note or outcome." },
      400
    );
  }

  const stage = STAGES.find((s) => s === body.stage) as Stage | undefined;

  try {
    const cfg = getConfig();
    const lead = await addActivity(
      cfg,
      id,
      { type, note, outcome, by },
      stage ? { stage } : undefined
    );
    return jsonResponse({ ok: true, lead });
  } catch (err) {
    console.error("crm/activity failed", err);
    return jsonResponse({ ok: false, error: "Could not log activity." }, 502);
  }
}
