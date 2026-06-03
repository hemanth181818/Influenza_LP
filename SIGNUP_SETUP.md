# Signup capture setup

The CTA form on the landing page (`/api/signup`) writes every submission to:

1. **Brevo** — adds the contact to a list (so you can send welcome / drip emails)
2. **Google Sheets** — appends a row (your source-of-truth backup)

Both writes run in parallel. If one fails, the other still records the signup and we still tell the user "you're in".

---

## 1. Brevo

1. Create a (free) account at https://app.brevo.com.
2. Make a contact list: **Contacts → Lists → New list**. Note its **numeric ID** (visible in the URL or list table).
3. Generate an API key: **Settings → SMTP & API → API Keys → Generate a new API key**. Copy it (starts with `xkeysib-...`).
4. (Optional but recommended) Build a welcome email automation: **Automations → Create → Welcome a new contact → trigger on "added to list X"**.

You'll need two values:
- `BREVO_API_KEY` = the key from step 3
- `BREVO_LIST_ID` = the numeric ID from step 2

---

## 2. Google Sheets webhook (via Apps Script)

This is the simplest way to get rows into a Sheet without OAuth.

1. Create a new Google Sheet. First row, columns: `timestamp | email | source | ip | user_agent`.
2. **Extensions → Apps Script**. Replace the default code with:

   ```javascript
   const SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_STRING";

   function doPost(e) {
     try {
       const body = JSON.parse(e.postData.contents);
       if (SECRET && body.secret !== SECRET) {
         return ContentService.createTextOutput(
           JSON.stringify({ ok: false, error: "bad secret" })
         ).setMimeType(ContentService.MimeType.JSON);
       }
       const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       sheet.appendRow([
         body.ts || new Date().toISOString(),
         body.email || "",
         body.source || "",
         body.ip || "",
         body.ua || "",
       ]);
       return ContentService.createTextOutput(JSON.stringify({ ok: true }))
         .setMimeType(ContentService.MimeType.JSON);
     } catch (err) {
       return ContentService.createTextOutput(
         JSON.stringify({ ok: false, error: String(err) })
       ).setMimeType(ContentService.MimeType.JSON);
     }
   }
   ```

3. **Deploy → New deployment → Type: Web app**.
   - Description: `Influenza signup webhook`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize, then copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).

You'll need two values:
- `SHEETS_WEBHOOK_URL` = the web-app URL above
- `SHEETS_WEBHOOK_SECRET` = the same string you put in `SECRET` (anything random; just keeps randos from spamming your sheet)

> Re-deploying the Apps Script after edits gives you a **new URL** — update `SHEETS_WEBHOOK_URL` in Vercel each time. To avoid this, use **Manage deployments → edit → New version** which keeps the same URL.

---

## 3. Vercel env vars

In the Vercel dashboard → your project → **Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `BREVO_API_KEY` | `xkeysib-...` | Production, Preview |
| `BREVO_LIST_ID` | `5` (or whatever your list ID is) | Production, Preview |
| `SHEETS_WEBHOOK_URL` | `https://script.google.com/macros/s/.../exec` | Production, Preview |
| `SHEETS_WEBHOOK_SECRET` | your random string | Production, Preview |

Then **redeploy** (the function won't pick up new env vars until next build).

---

## 4. Testing

After redeploy, hit the endpoint directly:

```bash
curl -X POST https://YOUR-DOMAIN/api/signup \
  -H "content-type: application/json" \
  -d '{"email":"test+1@example.com"}'
```

Expected: `{"ok":true}`, and:
- Row appears in your Google Sheet
- Contact appears in your Brevo list under **Contacts**

If something's off, check **Vercel → Deployments → latest → Functions → /api/signup → Logs**.
