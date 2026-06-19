/**
 * Airtable data layer for the CRM. The landing-page signup table is the single
 * source of truth for leads — this module reads it, updates pipeline fields,
 * and appends call/note activity.
 *
 * The pipeline fields live on the same record as the captured email. Activity
 * (calls, notes) is stored as a JSON array inside a single long-text field so
 * the CRM works against ONE table with no linked records to set up. The CRM UI
 * is the primary way to read it; the raw JSON is just a durable backing store.
 *
 * Field names are configurable via env vars but ship with sensible defaults —
 * see CRM_SETUP.md for the schema you need to create in Airtable.
 */

export const STAGES = [
  "New",
  "Contacted",
  "Call Booked",
  "Call Done",
  "Qualified",
] as const;

export type Stage = (typeof STAGES)[number];

export type ActivityType = "Call" | "Note" | "Email" | "Stage";

export interface Activity {
  type: ActivityType;
  note: string;
  outcome?: string;
  at: string; // ISO timestamp
  by?: string;
}

export interface Lead {
  id: string;
  email: string;
  name: string;
  phone: string;
  company: string;
  stage: Stage;
  platform: string;
  source: string;
  notes: string;
  nextAction: string; // YYYY-MM-DD or ""
  nextActionNote: string;
  lastContacted: string; // ISO or ""
  createdTime: string; // ISO
  activity: Activity[];
}

export interface FieldMap {
  email: string;
  name: string;
  phone: string;
  company: string;
  stage: string;
  platform: string;
  source: string;
  notes: string;
  nextAction: string;
  nextActionNote: string;
  lastContacted: string;
  activityLog: string;
}

export function getFieldMap(): FieldMap {
  return {
    email: process.env.AIRTABLE_EMAIL_FIELD || "Email",
    name: process.env.AIRTABLE_NAME_FIELD || "Name",
    phone: process.env.AIRTABLE_PHONE_FIELD || "Phone",
    company: process.env.AIRTABLE_COMPANY_FIELD || "Company",
    stage: process.env.AIRTABLE_STAGE_FIELD || "Stage",
    platform: process.env.AIRTABLE_PLATFORM_FIELD || "Platform",
    source: process.env.AIRTABLE_SOURCE_FIELD || "Source",
    notes: process.env.AIRTABLE_NOTES_FIELD || "Notes",
    nextAction: process.env.AIRTABLE_NEXT_ACTION_FIELD || "Next Action",
    nextActionNote:
      process.env.AIRTABLE_NEXT_ACTION_NOTE_FIELD || "Next Action Note",
    lastContacted: process.env.AIRTABLE_LAST_CONTACTED_FIELD || "Last Contacted",
    activityLog: process.env.AIRTABLE_ACTIVITY_FIELD || "Activity Log",
  };
}

export interface AirtableConfig {
  token: string;
  baseId: string;
  tableName: string;
  fields: FieldMap;
}

export function getConfig(): AirtableConfig {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;
  if (!token) throw new Error("AIRTABLE_TOKEN missing");
  if (!baseId) throw new Error("AIRTABLE_BASE_ID missing");
  if (!tableName) throw new Error("AIRTABLE_TABLE_NAME missing");
  return { token, baseId, tableName, fields: getFieldMap() };
}

function baseUrl(cfg: AirtableConfig): string {
  return `https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(
    cfg.tableName
  )}`;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function normaliseStage(v: unknown): Stage {
  const s = str(v).trim();
  const hit = STAGES.find((x) => x.toLowerCase() === s.toLowerCase());
  return hit ?? "New";
}

function parseActivity(v: unknown): Activity[] {
  const raw = str(v).trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Activity[];
    return [];
  } catch {
    return [];
  }
}

function recordToLead(
  rec: { id: string; createdTime: string; fields: Record<string, unknown> },
  f: FieldMap
): Lead {
  const fields = rec.fields || {};
  return {
    id: rec.id,
    email: str(fields[f.email]),
    name: str(fields[f.name]),
    phone: str(fields[f.phone]),
    company: str(fields[f.company]),
    stage: normaliseStage(fields[f.stage]),
    platform: str(fields[f.platform]),
    source: str(fields[f.source]),
    notes: str(fields[f.notes]),
    nextAction: str(fields[f.nextAction]),
    nextActionNote: str(fields[f.nextActionNote]),
    lastContacted: str(fields[f.lastContacted]),
    createdTime: rec.createdTime,
    activity: parseActivity(fields[f.activityLog]),
  };
}

/** List every lead. Handles Airtable pagination (100 records/page). */
export async function listLeads(cfg: AirtableConfig): Promise<Lead[]> {
  const leads: Lead[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(baseUrl(cfg));
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { authorization: `Bearer ${cfg.token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Airtable list ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      records: {
        id: string;
        createdTime: string;
        fields: Record<string, unknown>;
      }[];
      offset?: string;
    };
    for (const rec of data.records) leads.push(recordToLead(rec, cfg.fields));
    offset = data.offset;
  } while (offset);

  // Newest first.
  leads.sort((a, b) => (a.createdTime < b.createdTime ? 1 : -1));
  return leads;
}

/** Fetch a single record and map it to a Lead. */
export async function getLead(
  cfg: AirtableConfig,
  id: string
): Promise<Lead> {
  const res = await fetch(`${baseUrl(cfg)}/${id}`, {
    headers: { authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable get ${res.status}: ${text.slice(0, 200)}`);
  }
  const rec = (await res.json()) as {
    id: string;
    createdTime: string;
    fields: Record<string, unknown>;
  };
  return recordToLead(rec, cfg.fields);
}

/** Editable lead fields that the CRM can patch. */
export interface LeadPatch {
  name?: string;
  phone?: string;
  company?: string;
  stage?: Stage;
  platform?: string;
  notes?: string;
  nextAction?: string; // "" clears it
  nextActionNote?: string;
}

function patchToFields(patch: LeadPatch, f: FieldMap): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  if (patch.name !== undefined) fields[f.name] = patch.name;
  if (patch.phone !== undefined) fields[f.phone] = patch.phone;
  if (patch.company !== undefined) fields[f.company] = patch.company;
  if (patch.stage !== undefined) fields[f.stage] = patch.stage;
  if (patch.platform !== undefined)
    fields[f.platform] = patch.platform || null;
  if (patch.notes !== undefined) fields[f.notes] = patch.notes;
  if (patch.nextAction !== undefined)
    fields[f.nextAction] = patch.nextAction || null;
  if (patch.nextActionNote !== undefined)
    fields[f.nextActionNote] = patch.nextActionNote;
  return fields;
}

async function patchRecord(
  cfg: AirtableConfig,
  id: string,
  fields: Record<string, unknown>
): Promise<Lead> {
  const res = await fetch(`${baseUrl(cfg)}/${id}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${cfg.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ fields, typecast: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable update ${res.status}: ${text.slice(0, 200)}`);
  }
  const rec = (await res.json()) as {
    id: string;
    createdTime: string;
    fields: Record<string, unknown>;
  };
  return recordToLead(rec, cfg.fields);
}

/** Update editable lead fields. */
export async function updateLead(
  cfg: AirtableConfig,
  id: string,
  patch: LeadPatch
): Promise<Lead> {
  return patchRecord(cfg, id, patchToFields(patch, cfg.fields));
}

/**
 * Append an activity entry. Reads the current log, pushes the new entry, writes
 * it back, and bumps Last Contacted for Call/Email types. If the activity moves
 * the stage, that is passed through too.
 */
export async function addActivity(
  cfg: AirtableConfig,
  id: string,
  entry: { type: ActivityType; note: string; outcome?: string; by?: string },
  opts?: { stage?: Stage }
): Promise<Lead> {
  const current = await getLead(cfg, id);
  const now = new Date().toISOString();
  const activity: Activity[] = [
    ...current.activity,
    {
      type: entry.type,
      note: entry.note,
      outcome: entry.outcome,
      at: now,
      by: entry.by,
    },
  ];

  const fields: Record<string, unknown> = {
    [cfg.fields.activityLog]: JSON.stringify(activity),
  };
  if (entry.type === "Call" || entry.type === "Email") {
    fields[cfg.fields.lastContacted] = now;
  }
  if (opts?.stage) {
    fields[cfg.fields.stage] = opts.stage;
  }
  return patchRecord(cfg, id, fields);
}
