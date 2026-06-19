/**
 * Brevo (Sendinblue) transactional email — shared sender used by the CRM to
 * email leads directly from the pipeline. Reuses the same Brevo account/env as
 * the landing-page welcome email.
 *
 * Env vars:
 *   BREVO_API_KEY      — v3 API key, starts with xkeysib-
 *   BREVO_SENDER_EMAIL — verified sender email
 *   BREVO_SENDER_NAME  — display name, defaults to "Influenza"
 *   BREVO_REPLY_TO     — optional reply-to email
 */

export interface SendEmailInput {
  to: string;
  toName?: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  tags?: string[];
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wrap a plain-text message body in a light, on-brand HTML shell so emails sent
 * from the CRM look intentional rather than raw.
 */
export function plainToBrandedHtml(subject: string, body: string): string {
  const ink = "#F5EFE3";
  const cream = "#2E1023";
  const acid = "#FB5424";
  const muted = "rgba(46,16,35,0.62)";
  const safeBody = escapeHtml(body).replace(/\n/g, "<br />");

  return `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:${ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ink};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;">
        <tr><td style="padding:0 8px 14px 8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${muted};">
          Influenza
        </td></tr>
        <tr><td style="padding:8px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${cream};">
          ${safeBody}
        </td></tr>
        <tr><td style="padding:24px 8px 0 8px;border-top:1px solid rgba(46,16,35,0.18);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${muted};">
          <span style="color:${acid};">&#9733;</span>&nbsp; Sent from the Influenza team
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Influenza";
  const replyTo = process.env.BREVO_REPLY_TO;

  if (!apiKey) throw new Error("BREVO_API_KEY missing");
  if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL missing");

  const body: Record<string, unknown> = {
    sender: { email: senderEmail, name: senderName },
    to: [input.toName ? { email: input.to, name: input.toName } : { email: input.to }],
    subject: input.subject,
    htmlContent: input.html,
    textContent: input.text,
    tags: input.tags ?? ["crm-outreach"],
  };
  if (input.cc && input.cc.length) {
    body.cc = input.cc.map((email) => ({ email }));
  }
  if (replyTo) body.replyTo = { email: replyTo };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${text.slice(0, 300)}`);
  }
}
