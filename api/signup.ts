/**
 * POST /api/signup
 * Body: { email: string, source?: string }
 *
 * 1. Adds the contact to a Brevo list (creates if new, no-op if already present).
 * 2. Appends a row to a Google Sheet via an Apps Script webhook.
 *
 * Env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   BREVO_API_KEY          — from https://app.brevo.com/settings/keys/api
 *   BREVO_LIST_ID          — numeric ID of the list to add contacts to
 *   SHEETS_WEBHOOK_URL     — Google Apps Script web-app URL (POSTs JSON)
 *   SHEETS_WEBHOOK_SECRET  — optional shared secret to verify requests
 */

export const config = { runtime: "edge" };

const EMAIL_RE =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  let payload: { email?: unknown; source?: unknown };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const source =
    typeof payload.source === "string" ? payload.source.slice(0, 120) : "landing-cta";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Enter a valid email." }, 400);
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;
  const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
  const SHEETS_WEBHOOK_SECRET = process.env.SHEETS_WEBHOOK_SECRET;

  const ts = new Date().toISOString();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const ua = req.headers.get("user-agent") || "";

  // Run both writes in parallel; don't let one failure kill the other.
  const results = await Promise.allSettled([
    pushToBrevo({ email, source, BREVO_API_KEY, BREVO_LIST_ID }),
    pushToSheet({
      email,
      source,
      ts,
      ip,
      ua,
      url: SHEETS_WEBHOOK_URL,
      secret: SHEETS_WEBHOOK_SECRET,
    }),
  ]);

  const brevo = results[0];
  const sheet = results[1];

  // Hard-fail only if BOTH writes failed — we don't want to lose a signup.
  if (brevo.status === "rejected" && sheet.status === "rejected") {
    console.error("signup: both sinks failed", {
      brevo: brevo.reason,
      sheet: sheet.reason,
    });
    return json(
      { ok: false, error: "Something went wrong. Please try again." },
      502
    );
  }

  // Soft-warn if one failed — log it, still tell the user we got them.
  if (brevo.status === "rejected") {
    console.error("signup: brevo failed", brevo.reason);
  }
  if (sheet.status === "rejected") {
    console.error("signup: sheet failed", sheet.reason);
  }

  return json({ ok: true });
}

async function pushToBrevo(opts: {
  email: string;
  source: string;
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
}) {
  if (!opts.BREVO_API_KEY || !opts.BREVO_LIST_ID) {
    throw new Error("Brevo env vars missing");
  }
  const listId = Number(opts.BREVO_LIST_ID);
  if (!Number.isFinite(listId)) {
    throw new Error("BREVO_LIST_ID must be a number");
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": opts.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      listIds: [listId],
      updateEnabled: true,
      attributes: { SOURCE: opts.source },
    }),
  });

  // Brevo returns 201 (created) or 204 (updated). 400 with code "duplicate_parameter"
  // means the contact already exists — that's fine, we updateEnabled above.
  if (res.ok) return;

  const text = await res.text().catch(() => "");
  // "Contact already exist" surfaces as 400 in some flows even with updateEnabled.
  if (res.status === 400 && /already/i.test(text)) return;

  throw new Error(`Brevo ${res.status}: ${text.slice(0, 200)}`);
}

async function pushToSheet(opts: {
  email: string;
  source: string;
  ts: string;
  ip: string;
  ua: string;
  url?: string;
  secret?: string;
}) {
  if (!opts.url) throw new Error("SHEETS_WEBHOOK_URL missing");

  const res = await fetch(opts.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret: opts.secret || "",
      email: opts.email,
      source: opts.source,
      ts: opts.ts,
      ip: opts.ip,
      ua: opts.ua,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sheet ${res.status}: ${text.slice(0, 200)}`);
  }
}
