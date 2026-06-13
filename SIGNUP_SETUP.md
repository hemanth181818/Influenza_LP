# Signup capture setup

The CTA form on the landing page (`/api/signup`) writes every submitted email to **Airtable**, then automatically sends the **welcome email** via **Brevo**.

If the Airtable write fails, the user sees an error and the backend logs the failure in Vercel. If the Brevo send fails, the signup still succeeds (the lead is already saved) and the email error is logged — lead capture is never blocked by email.

The welcome template lives in `lib/welcome-email.mjs` and is shared by both the API route and the manual `scripts/send-welcome.mjs` batch sender, so they can't drift.

---

## 1. Airtable table

Create or use an Airtable table with an email field.

Required field:
- `Email` - email field or single line text field

The backend only writes the email value, so the table does not need any other fields.

---

## 2. Airtable token

Create a personal access token in Airtable with permission to create records in the target base.

Required scope:
- `data.records:write`

Required access:
- The base that contains your signup table

---

## 3. Environment variables

Local `.env` and Vercel both need:

| Name | Value |
|------|-------|
| `AIRTABLE_TOKEN` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Base ID, starts with `app` |
| `AIRTABLE_TABLE_NAME` | Table name or table ID |
| `AIRTABLE_EMAIL_FIELD` | Email field name, defaults to `Email` |
| `BREVO_API_KEY` | Brevo v3 API key, starts with `xkeysib-` |
| `BREVO_SENDER_EMAIL` | Verified Brevo sender address |
| `BREVO_SENDER_NAME` | Inbox display name, defaults to `Influenza` |
| `BREVO_REPLY_TO` | Optional reply-to address |
| `BREVO_CC` | Optional CC copied on every welcome email |
| `QUESTIONNAIRE_URL` | CTA link in the welcome email |

If `BREVO_API_KEY` or `BREVO_SENDER_EMAIL` is missing, the signup still saves to Airtable and the welcome email is skipped (logged as a warning).

> **Brevo IP authorization must be OFF.** Vercel functions send from rotating, shared egress IPs that cannot be reliably allow-listed. If IP authorization is enabled in Brevo (Settings → Security → Authorised IPs), production sends will fail intermittently with `401 unrecognised IP`. Disable it and rely on the API key + verified sender.

Then redeploy Vercel after setting the production environment variables.

---

## 4. Welcome email trigger

The welcome email is sent automatically by `/api/signup` right after the Airtable write — no Airtable automation is required.

If you also want side effects on new signups (Slack alert, CRM sync, etc.), add an optional Airtable automation:

1. In Airtable, open **Automations**.
2. Create an automation with trigger **When record created**.
3. Select the same table used by `AIRTABLE_TABLE_NAME`.
4. Add the action you want, such as Slack alert or webhook.
5. Turn the automation on.

Every successful signup creates one Airtable record, which fires this trigger.

---

## 5. Testing

After redeploy, hit the endpoint directly:

```bash
curl -X POST https://YOUR-DOMAIN/api/signup \
  -H "content-type: application/json" \
  -d '{"email":"test+1@example.com"}'
```

Expected: `{"ok":true}`, a new Airtable record appears, and the welcome email lands in the test inbox.

If something is off, check **Vercel -> Deployments -> latest -> Functions -> /api/signup -> Logs**.
