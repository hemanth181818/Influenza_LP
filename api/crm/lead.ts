/**
 * PATCH /api/crm/lead
 * Body: { id: string, patch: LeadPatch }
 *
 * Updates editable pipeline fields on a single lead (stage, owner, next action,
 * notes, name/phone/company). Returns the freshly-mapped lead.
 */

import { jsonResponse, requireAuth } from "../_lib/auth";
import {
  getConfig,
  updateLead,
  STAGES,
  type LeadPatch,
  type Stage,
} from "../_lib/airtable";

export const config = { runtime: "edge" };

function cleanPatch(input: Record<string, unknown>): LeadPatch {
  const patch: LeadPatch = {};
  const strFields: (keyof LeadPatch)[] = [
    "name",
    "phone",
    "company",
    "platform",
    "notes",
    "nextAction",
    "nextActionNote",
  ];
  for (const k of strFields) {
    if (typeof input[k] === "string") {
      (patch as Record<string, unknown>)[k] = (input[k] as string).slice(0, 5000);
    }
  }
  if (typeof input.stage === "string") {
    const stage = STAGES.find((s) => s === input.stage);
    if (stage) patch.stage = stage as Stage;
  }
  return patch;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "PATCH" && req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const unauth = await requireAuth(req);
  if (unauth) return unauth;

  let body: { id?: unknown; patch?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return jsonResponse({ ok: false, error: "Missing lead id." }, 400);

  const patch = cleanPatch(
    (body.patch && typeof body.patch === "object"
      ? body.patch
      : {}) as Record<string, unknown>
  );
  if (Object.keys(patch).length === 0) {
    return jsonResponse({ ok: false, error: "Nothing to update." }, 400);
  }

  try {
    const cfg = getConfig();
    const lead = await updateLead(cfg, id, patch);
    return jsonResponse({ ok: true, lead });
  } catch (err) {
    console.error("crm/lead update failed", err);
    return jsonResponse({ ok: false, error: "Could not update lead." }, 502);
  }
}
