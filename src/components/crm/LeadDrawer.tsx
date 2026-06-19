import { useEffect, useState } from "react";
import {
  STAGES,
  STAGE_META,
  PLATFORMS,
  companyName,
  initials,
  formatDate,
  relativeTime,
  toDateInput,
  type Lead,
  type LeadPatch,
  type Stage,
} from "@/lib/crm";

interface Props {
  lead: Lead;
  onClose: () => void;
  onPatch: (patch: LeadPatch) => Promise<void> | void;
  onActivity: (input: {
    type: "Call" | "Note" | "Email";
    note: string;
    outcome?: string;
    stage?: Stage;
  }) => Promise<void> | void;
  onEmail: (input: {
    subject: string;
    body: string;
    cc?: string;
  }) => Promise<void>;
  initialEmailOpen?: boolean;
}

const ACTIVITY_TONE: Record<string, string> = {
  Call: "bg-violet-500",
  Note: "bg-cream/40",
  Email: "bg-blue-500",
  Stage: "bg-acid",
};

function Field({
  label,
  value,
  placeholder,
  onSave,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (v: string) => void;
  type?: string;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      <input
        type={type}
        value={v}
        placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
        className="w-full border-2 border-cream/20 bg-ink px-2.5 py-2 text-sm text-cream outline-none focus:border-acid transition-colors"
      />
    </label>
  );
}

export default function LeadDrawer({
  lead,
  onClose,
  onPatch,
  onActivity,
  onEmail,
  initialEmailOpen = false,
}: Props) {
  const [actType, setActType] = useState<"Call" | "Note" | "Email">("Call");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [moveStage, setMoveStage] = useState<Stage | "">("");
  const [logging, setLogging] = useState(false);
  const [notesDraft, setNotesDraft] = useState(lead.notes);

  // Email composer state.
  const [emailOpen, setEmailOpen] = useState(initialEmailOpen);
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [sending, setSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !subject.trim() || !emailBody.trim()) return;
    setSending(true);
    setEmailMsg("");
    try {
      await onEmail({
        subject: subject.trim(),
        body: emailBody.trim(),
        cc: cc.trim() || undefined,
      });
      setSubject("");
      setEmailBody("");
      setCc("");
      setShowCc(false);
      setEmailOpen(false);
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => setNotesDraft(lead.notes), [lead.id, lead.notes]);

  // Reset the email composer when switching leads.
  useEffect(() => {
    setEmailOpen(initialEmailOpen);
    setSubject("");
    setCc("");
    setShowCc(false);
    setEmailBody("");
    setEmailMsg("");
  }, [lead.id, initialEmailOpen]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activity = [...lead.activity].reverse();

  async function submitActivity(e: React.FormEvent) {
    e.preventDefault();
    if (logging || (!note.trim() && !outcome.trim())) return;
    setLogging(true);
    try {
      await onActivity({
        type: actType,
        note: note.trim(),
        outcome: outcome.trim() || undefined,
        stage: moveStage || undefined,
      });
      setNote("");
      setOutcome("");
      setMoveStage("");
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-cream/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto border-2 border-cream bg-ink-soft shadow-[8px_8px_0_0_hsl(var(--cream))]">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b-2 border-cream bg-ink-soft px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center border-2 border-cream bg-acid font-display text-sm font-semibold text-ink-deep">
              {initials(lead)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-semibold leading-tight">
                {lead.name || lead.email}
              </h2>
              <a
                href={`mailto:${lead.email}`}
                className="block truncate text-xs text-acid hover:underline"
              >
                {lead.email}
              </a>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 border-2 border-cream/30 px-2 py-1 text-xs text-cream/70 hover:border-cream hover:text-cream"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Stage selector */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STAGES.map((s) => {
              const active = s === lead.stage;
              return (
                <button
                  key={s}
                  onClick={() => !active && onPatch({ stage: s })}
                  className={
                    "flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium transition-colors " +
                    (active
                      ? "border-cream bg-cream text-ink"
                      : "border-cream/25 text-cream/60 hover:border-cream/60 hover:text-cream")
                  }
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STAGE_META[s].dot}`}
                  />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* Contact details */}
          <section className="grid grid-cols-2 gap-3">
            <Field
              label="Name"
              value={lead.name}
              placeholder="Full name"
              onSave={(v) => onPatch({ name: v })}
            />
            <Field
              label="Phone"
              value={lead.phone}
              placeholder="+91…"
              type="tel"
              onSave={(v) => onPatch({ phone: v })}
            />
            <Field
              label="Company"
              value={lead.company}
              placeholder={companyName(lead) || "Company"}
              onSave={(v) => onPatch({ company: v })}
            />
            <label className="block">
              <span className="eyebrow mb-1 block">Platform</span>
              <select
                value={lead.platform}
                onChange={(e) => onPatch({ platform: e.target.value })}
                className="w-full border-2 border-cream/20 bg-ink px-2 py-2 text-sm text-cream outline-none focus:border-acid"
              >
                <option value="">— Select —</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* Next action */}
          <section className="border-2 border-cream/20 bg-ink/50 p-3">
            <p className="eyebrow-acid mb-2">Next action</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={toDateInput(lead.nextAction)}
                onChange={(e) => onPatch({ nextAction: e.target.value })}
                className="border-2 border-cream/20 bg-ink px-2 py-1.5 text-sm text-cream outline-none focus:border-acid"
              />
              {lead.nextAction && (
                <button
                  onClick={() => onPatch({ nextAction: "" })}
                  className="border-2 border-cream/20 px-2 text-xs text-cream/60 hover:border-cream hover:text-cream"
                >
                  Clear
                </button>
              )}
            </div>
            <Field
              label=""
              value={lead.nextActionNote}
              placeholder="e.g. Follow up on pricing"
              onSave={(v) => onPatch({ nextActionNote: v })}
            />
          </section>

          {/* Notes */}
          <section>
            <p className="eyebrow mb-1">Notes</p>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() =>
                notesDraft !== lead.notes && onPatch({ notes: notesDraft })
              }
              rows={3}
              placeholder="Context, background, anything useful…"
              className="w-full resize-y border-2 border-cream/20 bg-ink px-2.5 py-2 text-sm text-cream outline-none focus:border-acid transition-colors"
            />
          </section>

          {/* Email via Brevo */}
          <section className="border-2 border-cream/20 bg-ink/50 p-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow-acid">Email lead</p>
              <button
                type="button"
                onClick={() => setEmailOpen((o) => !o)}
                className="border-2 border-cream/25 px-2.5 py-1 text-xs font-medium text-cream/70 hover:border-cream hover:text-cream"
              >
                {emailOpen ? "Cancel" : "Compose"}
              </button>
            </div>

            {emailOpen && (
              <form onSubmit={submitEmail} className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-cream/50">
                    To <span className="text-cream/80">{lead.email}</span> via Brevo
                  </p>
                  {!showCc && (
                    <button
                      type="button"
                      onClick={() => setShowCc(true)}
                      className="text-[11px] font-medium text-acid hover:underline"
                    >
                      + Cc
                    </button>
                  )}
                </div>
                {showCc && (
                  <input
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    placeholder="Cc — comma-separated emails"
                    className="w-full border-2 border-cream/20 bg-ink px-2.5 py-2 text-sm text-cream outline-none focus:border-acid"
                  />
                )}
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full border-2 border-cream/20 bg-ink px-2.5 py-2 text-sm text-cream outline-none focus:border-acid"
                />
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  placeholder="Write your message…"
                  className="w-full resize-y border-2 border-cream/20 bg-ink px-2.5 py-2 text-sm text-cream outline-none focus:border-acid"
                />
                {emailMsg && (
                  <p className="text-xs text-rose-500">{emailMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={sending || !subject.trim() || !emailBody.trim()}
                  className="w-full border-2 border-cream bg-acid py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink-deep shadow-stamp-sm stamp-lift disabled:opacity-50 disabled:pointer-events-none"
                >
                  {sending ? "Sending…" : "Send email"}
                </button>
                <p className="text-[10px] text-cream/40">
                  Logged to the timeline automatically.
                </p>
              </form>
            )}
          </section>

          {/* Log activity */}
          <section className="border-2 border-cream bg-ink p-3 shadow-stamp-sm">
            <p className="eyebrow-acid mb-2">Log activity</p>
            <form onSubmit={submitActivity} className="space-y-2.5">
              <div className="flex gap-1.5">
                {(["Call", "Note", "Email"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActType(t)}
                    className={
                      "flex-1 border-2 py-1.5 text-xs font-medium transition-colors " +
                      (actType === t
                        ? "border-cream bg-cream text-ink"
                        : "border-cream/25 text-cream/60 hover:border-cream/60")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              {actType !== "Note" && (
                <input
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="Outcome — e.g. No answer, Booked demo…"
                  className="w-full border-2 border-cream/20 bg-ink-soft px-2.5 py-2 text-sm text-cream outline-none focus:border-acid"
                />
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={
                  actType === "Note"
                    ? "Write a note…"
                    : "What was said / next steps…"
                }
                className="w-full resize-y border-2 border-cream/20 bg-ink-soft px-2.5 py-2 text-sm text-cream outline-none focus:border-acid"
              />

              <div className="flex items-center gap-2">
                <select
                  value={moveStage}
                  onChange={(e) => setMoveStage(e.target.value as Stage | "")}
                  className="flex-1 border-2 border-cream/20 bg-ink-soft px-2 py-2 text-sm text-cream outline-none focus:border-acid"
                >
                  <option value="">Keep stage ({lead.stage})</option>
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      Move to {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={logging || (!note.trim() && !outcome.trim())}
                  className="border-2 border-cream bg-acid px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-deep shadow-stamp-sm stamp-lift disabled:opacity-50 disabled:pointer-events-none"
                >
                  {logging ? "…" : "Log"}
                </button>
              </div>
            </form>
          </section>

          {/* Timeline */}
          <section>
            <p className="eyebrow mb-3">
              Activity{" "}
              <span className="text-cream/35">· {lead.activity.length}</span>
            </p>
            {activity.length === 0 ? (
              <p className="text-sm text-cream/40">
                No activity yet. Log your first call or note above.
              </p>
            ) : (
              <ol className="space-y-3 border-l-2 border-cream/15 pl-4">
                {activity.map((a, i) => (
                  <li key={i} className="relative">
                    <span
                      className={`absolute -left-[1.43rem] top-1 h-2.5 w-2.5 rounded-full border-2 border-ink-soft ${
                        ACTIVITY_TONE[a.type] || "bg-cream/40"
                      }`}
                    />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-cream/80">
                        {a.type}
                        {a.outcome && (
                          <span className="ml-1.5 font-normal normal-case text-acid">
                            {a.outcome}
                          </span>
                        )}
                      </span>
                      <span
                        className="shrink-0 font-mono text-[10px] text-cream/40"
                        title={formatDate(a.at)}
                      >
                        {relativeTime(a.at)}
                      </span>
                    </div>
                    {a.note && (
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-cream/70">
                        {a.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Meta footer */}
          <p className="border-t border-cream/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/35">
            {lead.source ? `Source ${lead.source} · ` : ""}
            Captured {formatDate(lead.createdTime)}
          </p>
        </div>
      </aside>
    </div>
  );
}
