/**
 * POST /api/signup
 * Body: { email: string }
 *
 * Creates an Airtable record for the submitted email.
 *
 * Env vars (set in Vercel dashboard → Settings → Environment Variables):
 *   AIRTABLE_TOKEN         — Airtable personal access token
 *   AIRTABLE_BASE_ID       — Airtable base ID, starts with app...
 *   AIRTABLE_TABLE_NAME    — table name or table ID
 *   AIRTABLE_EMAIL_FIELD   — email field name, defaults to Email
 *
 *   BREVO_API_KEY          — Brevo v3 API key (xkeysib-...)
 *   BREVO_SENDER_EMAIL     — verified Brevo sender address
 *   BREVO_SENDER_NAME      — inbox display name, defaults to Influenza
 *   BREVO_REPLY_TO         — optional reply-to address
 *   BREVO_CC               — optional CC address on every welcome email
 *   QUESTIONNAIRE_URL      — CTA link in the welcome email
 */

import { sendWelcomeEmail } from "../lib/welcome-email.mjs";

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
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Enter a valid email." }, 400);
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const AIRTABLE_EMAIL_FIELD = process.env.AIRTABLE_EMAIL_FIELD || "Email";

  try {
    await pushToAirtable({
      email,
      token: AIRTABLE_TOKEN,
      baseId: AIRTABLE_BASE_ID,
      tableName: AIRTABLE_TABLE_NAME,
      emailField: AIRTABLE_EMAIL_FIELD,
    });
  } catch (err) {
    console.error("signup: airtable failed", err);
    return json(
      { ok: false, error: "Something went wrong. Please try again." },
      502
    );
  }

  // Fire the welcome email. Never block lead capture on an email failure —
  // the lead is already safely in Airtable at this point.
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (apiKey && senderEmail) {
      await sendWelcomeEmail({
        apiKey,
        senderEmail,
        senderName: process.env.BREVO_SENDER_NAME || "Influenza",
        to: email,
        replyTo: process.env.BREVO_REPLY_TO,
        cc: process.env.BREVO_CC,
        questionnaireUrl: process.env.QUESTIONNAIRE_URL,
        tags: ["influenza-signup", "issue-01-questionnaire", "auto-send"],
      });
    } else {
      console.warn("signup: welcome email skipped — BREVO config missing");
    }
  } catch (err) {
    console.error("signup: welcome email failed", err);
  }

  return json({ ok: true });
}

async function pushToAirtable(opts: {
  email: string;
  token?: string;
  baseId?: string;
  tableName?: string;
  emailField: string;
}) {
  if (!opts.token) throw new Error("AIRTABLE_TOKEN missing");
  if (!opts.baseId) throw new Error("AIRTABLE_BASE_ID missing");
  if (!opts.tableName) throw new Error("AIRTABLE_TABLE_NAME missing");

  const tablePath = encodeURIComponent(opts.tableName);
  const res = await fetch(
    `https://api.airtable.com/v0/${opts.baseId}/${tablePath}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${opts.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              [opts.emailField]: opts.email,
            },
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable ${res.status}: ${text.slice(0, 200)}`);
  }
}
