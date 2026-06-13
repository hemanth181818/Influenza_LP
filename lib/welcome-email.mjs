/**
 * Shared Influenza welcome email: template + Brevo send.
 *
 * Imported by both:
 *   - api/signup.ts          (automated send on every new signup)
 *   - scripts/send-welcome.mjs (manual batch send)
 *
 * Keep all welcome-email copy/markup here so the API and the script can
 * never drift apart.
 */

export const DEFAULT_QUESTIONNAIRE_URL = "https://tally.so/r/EkaLZA";
export const WELCOME_SUBJECT = "You're on the list. One last thing.";

/**
 * Send the welcome email via Brevo's v3 transactional endpoint.
 *
 * @param {Object} opts
 * @param {string} opts.apiKey        Brevo v3 API key (xkeysib-...)
 * @param {string} opts.senderEmail   Verified Brevo sender address
 * @param {string} [opts.senderName]  Inbox display name
 * @param {string} opts.to            Recipient email
 * @param {string} [opts.replyTo]     Reply-to address
 * @param {string} [opts.cc]          CC address
 * @param {string} [opts.questionnaireUrl]
 * @param {string[]} [opts.tags]
 * @returns {Promise<{messageId?: string}>}
 */
export async function sendWelcomeEmail(opts) {
  const url = opts.questionnaireUrl || DEFAULT_QUESTIONNAIRE_URL;

  const body = {
    sender: { email: opts.senderEmail, name: opts.senderName || "Influenza" },
    to: [{ email: opts.to }],
    subject: WELCOME_SUBJECT,
    htmlContent: buildWelcomeHtml(url),
    textContent: buildWelcomeText(url),
    tags: opts.tags || ["influenza-signup", "issue-01-questionnaire"],
  };
  if (opts.replyTo) body.replyTo = { email: opts.replyTo };
  if (opts.cc) body.cc = [{ email: opts.cc }];

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": opts.apiKey,
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

export function buildWelcomeText(url) {
  return [
    "THE CREATOR MARKETING QUARTERLY. ISSUE 01.",
    "",
    "You're on the list.",
    "",
    "Thanks for signing up. We're rolling Issue 01 out to a small",
    "cohort first, and we'd rather build around your workflow than",
    "guess at it.",
    "",
    "One last thing. A 2-minute questionnaire so we can tailor the",
    "workspace to how you actually run your creator program.",
    "",
    `Open the questionnaire: ${url}`,
    "",
    "Team Influenza",
  ].join("\n");
}

export function buildWelcomeHtml(url) {
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
    <title>You're on the list</title>
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
      You're in. A 2-minute questionnaire and we'll tailor the workspace to how you actually work.
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
                      You're in
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- MASTHEAD -->
            <tr>
              <td class="pad-x" style="padding:44px 40px 0 40px;">
                <p style="margin:0 0 22px 0;font-family:'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${muted};">
                  <span style="color:${acid};">&#9733;</span>&nbsp; Welcome aboard
                </p>
                <h1 class="h1" style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:52px;line-height:0.95;letter-spacing:-0.035em;color:${cream};">
                  You're on
                </h1>
                <h1 class="h1" style="margin:0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:52px;line-height:0.95;letter-spacing:-0.035em;color:${cream};">
                  the <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:${acid};">list.</span>
                </h1>
              </td>
            </tr>

            <!-- LEDE -->
            <tr>
              <td class="pad-x" style="padding:28px 40px 0 40px;">
                <p style="margin:0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${cream};opacity:0.82;">
                  Thanks for signing up. We're rolling Issue 01 out to a small cohort first, and we'd rather build around your workflow than guess at it.
                </p>
                <p style="margin:14px 0 0 0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:${cream};opacity:0.82;">
                  <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:18px;color:${cream};">One last thing.</span> A 2-minute questionnaire so we can tailor the workspace to how you actually run your creator program.
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
                        The questionnaire
                      </p>
                      <h2 class="h2" style="margin:8px 0 6px 0;font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:26px;line-height:1.1;letter-spacing:-0.02em;color:${cream};">
                        Tell us how <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:${acid};">you</span> work.
                      </h2>
                      <p style="margin:0;font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;line-height:1.55;color:${cream};opacity:0.72;">
                        A few quick questions on your brand, your creator program, and the bits that drive you mad. About two minutes.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td class="cta" style="padding:8px 24px 24px 24px;" align="left">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="0%" strokecolor="${cream}" strokeweight="2pt" fillcolor="${acid}">
                        <w:anchorlock/>
                        <center style="color:${ink};font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;">Open the questionnaire &#8599;</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a href="${safeUrl}" target="_blank" rel="noopener" style="display:inline-block;background:${acid};color:${ink};font-family:'Bricolage Grotesque',Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;padding:15px 22px;border:2px solid ${cream};box-shadow:3px 3px 0 0 ${cream};">
                        Open the questionnaire &nbsp;&#8599;
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
                  We read every reply. If anything's broken in your creator program right now, hit reply and tell us. That's the fastest way to influence what we ship next.
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

export function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
