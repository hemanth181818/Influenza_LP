/**
 * Manually send the Influenza FOLLOW-UP (questionnaire reminder) email.
 *
 * Same magazine theme as the welcome email (see api/signup.ts), but the copy
 * nudges people who signed up and have not yet filled the 2-minute
 * questionnaire. Adds the BREVO_CC address as CC.
 *
 * Usage (from project root):
 *   node scripts/send-followup.mjs alice@example.com bob@example.com
 *   node scripts/send-followup.mjs --dry alice@example.com   # preview, no send
 *
 * Reads credentials from .env in the project root.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DEFAULT_QUESTIONNAIRE_URL = "https://form.typeform.com/to/j6xIPLoP";
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// --- minimal .env loader (no dependency) ---------------------------------
function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(join(ROOT, ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (env[key] === undefined || env[key] === "") env[key] = val;
    }
  } catch {
    // no .env file — rely on process.env
  }
  return env;
}

// --- args ------------------------------------------------------------------
const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry") || argv.includes("--dry-run");
const recipients = argv
  .filter((a) => !a.startsWith("--"))
  .flatMap((a) => a.split(","))
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (recipients.length === 0) {
  console.error(
    "No recipients given.\n\nUsage:\n  node scripts/send-followup.mjs alice@example.com bob@example.com\n  node scripts/send-followup.mjs --dry alice@example.com"
  );
  process.exit(1);
}

const invalid = recipients.filter((e) => !EMAIL_RE.test(e) || e.length > 254);
if (invalid.length) {
  console.error("Invalid email(s):", invalid.join(", "));
  process.exit(1);
}

const env = loadEnv();
const apiKey = env.BREVO_API_KEY;
const senderEmail = env.BREVO_SENDER_EMAIL;
const senderName = env.BREVO_SENDER_NAME || "Kortex";
const replyTo = env.BREVO_REPLY_TO;
const cc = env.BREVO_CC;
const questionnaireUrl = env.QUESTIONNAIRE_URL || DEFAULT_QUESTIONNAIRE_URL;

if (!apiKey) {
  console.error("BREVO_API_KEY missing in .env");
  process.exit(1);
}
if (!senderEmail) {
  console.error("BREVO_SENDER_EMAIL missing in .env");
  process.exit(1);
}

// --- send ------------------------------------------------------------------
async function sendFollowup(to) {
  const body = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: to }],
    subject: "Still got 2 minutes? We're holding your spot.",
    htmlContent: buildFollowupHtml(questionnaireUrl),
    textContent: buildFollowupText(questionnaireUrl),
    tags: ["influenza-signup", "issue-01-questionnaire", "followup", "manual-send"],
  };
  if (replyTo) body.replyTo = { email: replyTo };
  if (cc) body.cc = [{ email: cc }];

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
  return res.json().catch(() => ({}));
}

console.log(
  `\nInfluenza follow-up (questionnaire reminder)\n  from:   ${senderName} <${senderEmail}>` +
    (replyTo ? `\n  reply:  ${replyTo}` : "") +
    (cc ? `\n  cc:     ${cc}` : "") +
    `\n  link:   ${questionnaireUrl}\n  count:  ${recipients.length}` +
    (dryRun ? "\n  MODE:   DRY RUN (nothing will be sent)" : "") +
    "\n"
);

let ok = 0;
let failed = 0;
for (const to of recipients) {
  if (dryRun) {
    console.log(`  [dry] would send to ${to}`);
    ok++;
    continue;
  }
  try {
    const out = await sendFollowup(to);
    console.log(`  sent  -> ${to}${out?.messageId ? `  (${out.messageId})` : ""}`);
    ok++;
  } catch (err) {
    console.error(`  FAIL  -> ${to}  ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} ok, ${failed} failed.\n`);
process.exit(failed ? 1 : 0);

// --- template (same theme as api/signup.ts welcome email) ------------------
function buildFollowupText(url) {
  return [
    "THE CREATOR MARKETING QUARTERLY. ISSUE 01.",
    "",
    "A quick nudge.",
    "",
    "You signed up for Influenza a little while back. Thank you. We're",
    "still building the cohort around real workflows, and we haven't",
    "got your answers yet.",
    "",
    "It's the same 2-minute questionnaire. The more we know about how",
    "you run your creator program, the more the workspace bends to",
    "fit it. Spots in the first cohort are limited and we're holding",
    "yours.",
    "",
    `Open the questionnaire: ${url}`,
    "",
    "Already done it? Ignore this, you're all set.",
    "",
    "Team Influenza",
  ].join("\n");
}

function buildFollowupHtml(url) {
  const ink = "#F5EFE3";
  const inkSoft = "#EFE5CF";
  const cream = "#2E1023";
  const acid = "#FB5424";
  const muted = "rgba(46,16,35,0.62)";
  const hair = "rgba(46,16,35,0.18)";

  const safeUrl = escapeHtml(url);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>Still got 2 minutes?</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Instrument+Serif:ital@0;1&family=Bricolage+Grotesque:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      body { margin:0; padding:0; background:${ink}; }
      a { text-decoration:none; }
      @media (max-width:480px) {
        .h1     { font-size:40px !important; line-height:0.95 !important; }
        .h2     { font-size:22px !important; }
        .pad-x  { padding-left:24px !important; padding-right:24px !important; }
        .cta a  { font-size:12px !important; padding:14px 18px !important; }
        .tri td { padding:14px 12px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${ink};color:${cream};font-family:'Bricolage Grotesque',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      A quick nudge. The 2-minute questionnaire is still open and your cohort spot is held.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${ink};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;background:${ink};">

            <!-- DATELINE STRIP -->
            <tr>
              <td class="pad-x" style="padding:0 40px 14px 40px;border-bottom:1px solid ${hair};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${muted};">
                      The Creator Marketing Quarterly. Issue 01.
                    </td>
                    <td align="right" style="font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${muted};white-space:nowrap;">
                      <span style="display:inline-block;width:6px;height:6px;background:${acid};border-radius:50%;vertical-align:middle;margin-right:6px;"></span>
                      Reminder
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- MASTHEAD -->
            <tr>
              <td class="pad-x" style="padding:44px 40px 0 40px;">
                <p style="margin:0 0 22px 0;font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${muted};">
                  <span style="color:${acid};">&#9733;</span>&nbsp; A quick nudge
                </p>
                <h1 class="h1" style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:52px;line-height:0.95;letter-spacing:-0.035em;color:${cream};">
                  Still got
                </h1>
                <h1 class="h1" style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:52px;line-height:0.95;letter-spacing:-0.035em;color:${cream};">
                  two <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:${acid};">minutes?</span>
                </h1>
              </td>
            </tr>

            <!-- LEDE -->
            <tr>
              <td class="pad-x" style="padding:28px 40px 0 40px;">
                <p style="margin:0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${cream};opacity:0.82;">
                  You signed up for Influenza a little while back. Thank you. We're still building the cohort around real workflows, and we haven't got your answers yet.
                </p>
                <p style="margin:14px 0 0 0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${cream};opacity:0.82;">
                  <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:18px;color:${cream};">Same 2-minute questionnaire.</span> The more we know about how you run your creator program, the more the workspace bends to fit it.
                </p>
              </td>
            </tr>

            <!-- CTA CARD -->
            <tr>
              <td class="pad-x" style="padding:28px 40px 0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${inkSoft};border:2px solid ${cream};box-shadow:4px 4px 0 0 ${cream};">
                  <tr>
                    <td style="padding:24px 24px 8px 24px;">
                      <p style="margin:0;font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${acid};">
                        Your spot is held
                      </p>
                      <h2 class="h2" style="margin:8px 0 6px 0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:26px;line-height:1.1;letter-spacing:-0.02em;color:${cream};">
                        Pick up where you <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:${acid};">left off.</span>
                      </h2>
                      <p style="margin:0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:${cream};opacity:0.72;">
                        A few quick questions on your brand, your creator program, and the bits that drive you mad. Spots in the first cohort are limited, and this takes about two minutes.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td class="cta" style="padding:8px 24px 24px 24px;" align="left">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="0%" strokecolor="${cream}" strokeweight="2pt" fillcolor="${acid}">
                        <w:anchorlock/>
                        <center style="color:${ink};font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;">Finish the questionnaire &#8599;</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${safeUrl}" target="_blank" rel="noopener" style="display:inline-block;background:${acid};color:${ink};font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;padding:15px 22px;border:2px solid ${cream};box-shadow:3px 3px 0 0 ${cream};">
                        Finish the questionnaire &nbsp;&#8599;
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TRI-STRIP -->
            <tr>
              <td class="pad-x" style="padding:28px 40px 0 40px;">
                <table role="presentation" class="tri" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${cream};background:${ink};">
                  <tr>
                    <td width="33.33%" style="padding:18px 14px;border-right:2px solid ${cream};vertical-align:top;">
                      <div style="font-family:'Fraunces',Georgia,serif;color:${acid};font-weight:600;font-size:18px;line-height:1;">I.</div>
                      <div style="font-family:'Fraunces',Georgia,serif;font-weight:600;color:${cream};font-size:18px;margin-top:8px;line-height:1.1;">Scout</div>
                      <div style="font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${muted};margin-top:6px;">From one place</div>
                    </td>
                    <td width="33.33%" style="padding:18px 14px;border-right:2px solid ${cream};vertical-align:top;">
                      <div style="font-family:'Fraunces',Georgia,serif;color:${acid};font-weight:600;font-size:18px;line-height:1;">II.</div>
                      <div style="font-family:'Fraunces',Georgia,serif;font-weight:600;color:${cream};font-size:18px;margin-top:8px;line-height:1.1;">Push</div>
                      <div style="font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${muted};margin-top:6px;">Slow movers</div>
                    </td>
                    <td width="33.34%" style="padding:18px 14px;vertical-align:top;">
                      <div style="font-family:'Fraunces',Georgia,serif;color:${acid};font-weight:600;font-size:18px;line-height:1;">III.</div>
                      <div style="font-family:'Fraunces',Georgia,serif;font-weight:600;color:${cream};font-size:18px;margin-top:8px;line-height:1.1;">Measure</div>
                      <div style="font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:${muted};margin-top:6px;">Every rupee</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- SIGN-OFF -->
            <tr>
              <td class="pad-x" style="padding:28px 40px 0 40px;">
                <p style="margin:0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.65;color:${cream};opacity:0.72;">
                  Already filled it out? Then ignore this, you're all set, and we'll be in touch soon. If something's broken in your creator program right now, hit reply and tell us. That's the fastest way to influence what we ship next.
                </p>
                <p style="margin:20px 0 0 0;font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:18px;color:${cream};">
                  Team Influenza
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td class="pad-x" style="padding:32px 40px 40px 40px;">
                <div style="border-top:1px dashed ${hair};padding-top:14px;text-align:center;font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${muted};">
                  Influenza. Issue 01.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
