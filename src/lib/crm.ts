/**
 * CRM API client + shared types for the frontend. Mirrors the shapes returned
 * by /api/crm/*. All calls use same-origin cookies for auth.
 */

export const STAGES = [
  "New",
  "Contacted",
  "Call Booked",
  "Call Done",
  "Qualified",
] as const;

export type Stage = (typeof STAGES)[number];

export const PLATFORMS = ["Email", "LinkedIn", "WhatsApp"] as const;
export type Platform = (typeof PLATFORMS)[number];

export type ActivityType = "Call" | "Note" | "Email" | "Stage";

export interface Activity {
  type: ActivityType;
  note: string;
  outcome?: string;
  at: string;
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
  nextAction: string;
  nextActionNote: string;
  lastContacted: string;
  createdTime: string;
  activity: Activity[];
}

export interface LeadPatch {
  name?: string;
  phone?: string;
  company?: string;
  stage?: Stage;
  platform?: string;
  notes?: string;
  nextAction?: string;
  nextActionNote?: string;
}

export class AuthError extends Error {}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new AuthError("Not authenticated");
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok || !(data as { ok?: boolean })?.ok) {
    const msg =
      (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function login(password: string): Promise<void> {
  const res = await fetch("/api/crm/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  await parse<{ ok: true }>(res);
}

export async function logout(): Promise<void> {
  await fetch("/api/crm/logout", { method: "POST" });
}

export async function fetchLeads(): Promise<Lead[]> {
  const res = await fetch("/api/crm/leads", {
    headers: { accept: "application/json" },
  });
  const data = await parse<{ ok: true; leads: Lead[] }>(res);
  return data.leads;
}

export async function patchLead(
  id: string,
  patch: LeadPatch
): Promise<Lead> {
  const res = await fetch("/api/crm/lead", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, patch }),
  });
  const data = await parse<{ ok: true; lead: Lead }>(res);
  return data.lead;
}

export async function sendLeadEmail(input: {
  id: string;
  subject: string;
  body: string;
  cc?: string;
}): Promise<Lead> {
  const res = await fetch("/api/crm/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parse<{ ok: true; lead: Lead }>(res);
  return data.lead;
}

export async function logActivity(input: {
  id: string;
  type: Exclude<ActivityType, "Stage">;
  note: string;
  outcome?: string;
  by?: string;
  stage?: Stage;
}): Promise<Lead> {
  const res = await fetch("/api/crm/activity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parse<{ ok: true; lead: Lead }>(res);
  return data.lead;
}

// --- presentation helpers ---

export const STAGE_META: Record<
  Stage,
  { tone: string; dot: string; short: string }
> = {
  New: { tone: "text-cream/70", dot: "bg-cream/40", short: "New" },
  Contacted: { tone: "text-cream/80", dot: "bg-blue-500", short: "Contacted" },
  "Call Booked": { tone: "text-cream", dot: "bg-amber-500", short: "Booked" },
  "Call Done": { tone: "text-cream", dot: "bg-violet-500", short: "Done" },
  Qualified: { tone: "text-cream", dot: "bg-acid", short: "Qualified" },
};

// Common personal-email providers — leads on these have no real "company".
const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "zoho.com",
  "mail.com",
  "rediffmail.com",
  "hotmail.co.uk",
]);

/**
 * Display company for a lead: the typed Company if present, otherwise derived
 * from the email domain. Personal-email providers collapse to "Personal email".
 */
export function companyName(lead: Lead): string {
  if (lead.company && lead.company.trim()) return lead.company.trim();
  const domain = lead.email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return "";
  if (PERSONAL_DOMAINS.has(domain)) return "Personal email";
  const labels = domain.split(".").filter(Boolean);
  if (labels.length < 2) return domain;
  const sld = labels[labels.length - 2];
  return sld.charAt(0).toUpperCase() + sld.slice(1);
}

export function isPersonalEmail(lead: Lead): boolean {
  const domain = lead.email.split("@")[1]?.toLowerCase().trim();
  return !!domain && PERSONAL_DOMAINS.has(domain);
}

export function initials(lead: Lead): string {
  const base = lead.name || lead.email || "?";
  const parts = base.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function relativeTime(iso: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const day = 86_400_000;
  const abs = Math.abs(diff);
  if (abs < 3_600_000) {
    const m = Math.round(diff / 60_000);
    return m <= 0 ? "just now" : `${m}m ago`;
  }
  if (abs < day) return `${Math.round(diff / 3_600_000)}h ago`;
  if (abs < 7 * day) return `${Math.round(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** YYYY-MM-DD for <input type="date">. */
export function toDateInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Days until a next-action date. Negative = overdue. null = no date. */
export function daysUntil(value: string): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}
