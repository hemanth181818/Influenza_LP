/**
 * Manually send the Influenza welcome email to one or more recipients.
 *
 * Reuses the exact template and Brevo call from api/signup.ts, and adds the
 * BREVO_CC address as CC (which the production signup handler does not do).
 *
 * Usage (from project root):
 *   node scripts/send-welcome.mjs alice@example.com bob@example.com
 *   node scripts/send-welcome.mjs --dry alice@example.com   # preview, no send
 *
 * Reads credentials from .env in the project root.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  buildWelcomeHtml,
  buildWelcomeText,
  WELCOME_SUBJECT,
  DEFAULT_QUESTIONNAIRE_URL,
} from "../lib/welcome-email.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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
    "No recipients given.\n\nUsage:\n  node scripts/send-welcome.mjs alice@example.com bob@example.com\n  node scripts/send-welcome.mjs --dry alice@example.com"
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
async function sendWelcome(to) {
  const body = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: to }],
    subject: WELCOME_SUBJECT,
    htmlContent: buildWelcomeHtml(questionnaireUrl),
    textContent: buildWelcomeText(questionnaireUrl),
    tags: ["influenza-signup", "issue-01-questionnaire", "manual-send"],
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
  `\nInfluenza welcome email\n  from:   ${senderName} <${senderEmail}>` +
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
    const out = await sendWelcome(to);
    console.log(`  sent  -> ${to}${out?.messageId ? `  (${out.messageId})` : ""}`);
    ok++;
  } catch (err) {
    console.error(`  FAIL  -> ${to}  ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} ok, ${failed} failed.\n`);
process.exit(failed ? 1 : 0);
