/**
 * POST /api/crm/email
 * Body: { id: string, subject: string, body: string }
 *
 * Sends a plain-text email to a lead via Brevo, then records an "Email" entry
 * on that lead's activity timeline (and bumps Last Contacted). The email itself
 * is the source of truth for what was sent; the activity log keeps the CRM
 * history in one place.
 */

import { jsonResponse, requireAuth } from "../_lib/auth";
import { addActivity, getConfig, getLead } from "../_lib/airtable";
import { plainToBrandedHtml, sendEmail } from "../_lib/brevo";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const unauth = await requireAuth(req);
  if (unauth) return unauth;

  let body: { id?: unknown; subject?: unknown; body?: unknown; cc?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const message =
    typeof body.body === "string" ? body.body.trim().slice(0, 8000) : "";

  if (!id) return jsonResponse({ ok: false, error: "Missing lead id." }, 400);
  if (!subject)
    return jsonResponse({ ok: false, error: "Subject is required." }, 400);
  if (!message)
    return jsonResponse({ ok: false, error: "Message is required." }, 400);

  // Cc: from the compose field plus an optional default (BREVO_CC env).
  const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const ccRaw = typeof body.cc === "string" ? body.cc : "";
  const ccCandidates = [...ccRaw.split(/[,;\s]+/), process.env.BREVO_CC || ""];
  const seen = new Set<string>();
  const invalid: string[] = [];
  const cc: string[] = [];
  for (const raw of ccCandidates) {
    const addr = raw.trim().toLowerCase();
    if (!addr) continue;
    if (!EMAIL_RE.test(addr)) {
      invalid.push(addr);
      continue;
    }
    if (seen.has(addr)) continue;
    seen.add(addr);
    cc.push(addr);
  }
  if (invalid.length) {
    return jsonResponse(
      { ok: false, error: `Invalid Cc address: ${invalid[0]}` },
      400
    );
  }

  try {
    const cfg = getConfig();
    const lead = await getLead(cfg, id);
    if (!lead.email) {
      return jsonResponse(
        { ok: false, error: "Lead has no email address." },
        400
      );
    }

    // Don't Cc the primary recipient.
    const ccFinal = cc.filter((a) => a !== lead.email.toLowerCase());

    await sendEmail({
      to: lead.email,
      toName: lead.name || undefined,
      cc: ccFinal.length ? ccFinal : undefined,
      subject,
      html: plainToBrandedHtml(subject, message),
      text: message,
      tags: ["crm-outreach"],
    });

    // Log it on the timeline. Subject becomes the activity "outcome" so it
    // reads cleanly in the feed.
    const updated = await addActivity(cfg, id, {
      type: "Email",
      note: message,
      outcome: subject,
    });

    return jsonResponse({ ok: true, lead: updated });
  } catch (err) {
    console.error("crm/email failed", err);
    const msg =
      err instanceof Error && /Brevo|BREVO/.test(err.message)
        ? "Email could not be sent. Check Brevo config."
        : "Could not send email.";
    return jsonResponse({ ok: false, error: msg }, 502);
  }
}
