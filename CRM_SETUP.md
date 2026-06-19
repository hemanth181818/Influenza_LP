# CRM / lead pipeline setup

The internal CRM lives at **`/crm`** on the same deployment as the landing page.
It reads and writes the **same Airtable table** your signups already land in
(`/api/signup`), so every new signup shows up in the pipeline automatically — no
sync, no second database.

- Kanban board: New → Contacted → Call Booked → Call Done → Qualified → Won / Lost
- Drag cards between stages, or change stage from the lead drawer
- Per-lead detail: name, phone, company, owner, next-action date, notes
- Call / note / email logging with an activity timeline
- "Overdue" and "due today" badges driven by the next-action date
- Gated by a single shared team password

---

## 1. Add the pipeline fields to your Airtable table

Open the **same table** referenced by `AIRTABLE_TABLE_NAME`. It already has the
`Email` field. Add the following fields (the names must match exactly, or set
the matching `AIRTABLE_*_FIELD` env var to your custom name):

| Field             | Airtable type            | Notes                                                                 |
|-------------------|--------------------------|-----------------------------------------------------------------------|
| `Email`           | Email / single line text | Already exists.                                                       |
| `Name`            | Single line text         | Contact name.                                                         |
| `Phone`           | Single line text         | Phone number.                                                        |
| `Company`         | Single line text         | Company / brand.                                                     |
| `Stage`           | **Single select**        | Options below — names must match exactly.                            |
| `Platform`        | **Single select**        | Outreach channel: `Email`, `LinkedIn`, `WhatsApp`.                  |
| `Source`          | Single line text         | Where the lead came from (optional).                                 |
| `Notes`           | Long text                | Freeform context.                                                    |
| `Next Action`     | Date                     | Drives the due/overdue badges.                                       |
| `Next Action Note`| Single line text         | What the next action is.                                             |
| `Last Contacted`  | Date (or Date+time)      | Auto-stamped when you log a Call or Email.                           |
| `Activity Log`    | Long text                | App-managed JSON of the call/note timeline. Don't hand-edit.         |

### `Stage` single-select options (exact spelling)

```
New
Contacted
Call Booked
Call Done
Qualified
Won
Lost
```

> You don't strictly have to pre-create every option — the API sends updates
> with `typecast: true`, so Airtable will create a missing select option on the
> fly. Pre-creating them just lets you set the colours.

Existing rows with an empty `Stage` are treated as **New** in the board.

---

## 2. Airtable token scope

The signup token currently only needs write access. The CRM also **reads and
updates** records, so make sure your `AIRTABLE_TOKEN` has these scopes on the
base:

- `data.records:read`
- `data.records:write`

If you created the token with write-only access, edit it (or make a new one) and
update `AIRTABLE_TOKEN` in Vercel.

---

## 3. Environment variables

In **Vercel → Settings → Environment Variables** (and your local `.env`):

| Name                 | Value                                                            |
|----------------------|-----------------------------------------------------------------|
| `CRM_PASSWORD`       | The shared password the team types at `/crm`.                   |
| `CRM_SESSION_SECRET` | Long random string used to sign session cookies (keep secret).  |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The Airtable connection reuses the existing `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`
and `AIRTABLE_TABLE_NAME`. The `AIRTABLE_*_FIELD` overrides are optional — only
set them if your column names differ from the defaults in the table above.

Redeploy after setting production env vars.

---

## 4. Using it

1. Go to `https://YOUR-DOMAIN/crm`.
2. Enter the team password. A session cookie keeps you logged in for 7 days.
3. New signups appear in the **New** column automatically.
4. Click a card to open the lead, fill in name/phone, set a next action, and log
   calls. Drag a card (or use the stage buttons) to move it down the pipeline.

### Logging a call

Open a lead → **Log activity** → pick `Call` → jot the outcome ("No answer",
"Booked demo") and any notes → optionally move the stage in the same action →
**Log**. Logging a call or email auto-updates `Last Contacted`.

---

## 5. Security notes

- The whole `/crm` UI and every `/api/crm/*` route require a valid signed
  session cookie. The cookie is `HttpOnly`, `Secure`, `SameSite=Lax`.
- There are no per-user accounts — it's one shared password. Rotate it by
  changing `CRM_PASSWORD` (existing sessions stay valid until they expire or
  you also rotate `CRM_SESSION_SECRET`, which logs everyone out immediately).
- This is internal-team-grade auth, appropriate for a small private pipeline.
  If you later need per-person logins and audit trails, the API layer
  (`api/_lib/auth.ts`) is the place to swap in real accounts.

---

## 6. Troubleshooting

| Symptom                              | Likely cause                                                        |
|--------------------------------------|---------------------------------------------------------------------|
| Login says "Server not configured"   | `CRM_PASSWORD` or `CRM_SESSION_SECRET` not set in Vercel.            |
| "Could not load leads"               | `AIRTABLE_TOKEN` missing `data.records:read`, or wrong base/table.  |
| Stage change errors                  | `Stage` field missing, or it's not a single-select.                 |
| Activity not saving                  | `Activity Log` long-text field missing.                             |
| Dates look wrong                     | `Next Action` / `Last Contacted` must be Date-type fields.          |

Check **Vercel → Deployments → latest → Functions → /api/crm/...→ Logs** — each
handler logs the specific failure.
