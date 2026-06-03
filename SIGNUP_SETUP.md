# Signup capture setup

The CTA form on the landing page (`/api/signup`) writes every submitted email directly to **Airtable**.

If the Airtable write fails, the user sees an error and the backend logs the failure in Vercel.

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

Then redeploy Vercel after setting the production environment variables.

---

## 4. Airtable trigger

To trigger an automation when someone enters their email:

1. In Airtable, open **Automations**.
2. Create an automation with trigger **When record created**.
3. Select the same table used by `AIRTABLE_TABLE_NAME`.
4. Add the action you want, such as send email, Slack alert, or webhook.
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

Expected: `{"ok":true}` and a new Airtable record appears.

If something is off, check **Vercel -> Deployments -> latest -> Functions -> /api/signup -> Logs**.
