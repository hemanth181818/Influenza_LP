import {
  initials,
  relativeTime,
  daysUntil,
  formatDate,
  companyName,
  type Lead,
} from "@/lib/crm";

interface Props {
  lead: Lead;
  onOpen: () => void;
  onDragStart: () => void;
  dragging: boolean;
}

export default function LeadCard({
  lead,
  onOpen,
  onDragStart,
  dragging,
}: Props) {
  const last = lead.activity[lead.activity.length - 1];
  const due = daysUntil(lead.nextAction);

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={onOpen}
      className={
        "group cursor-pointer border-2 border-cream/80 bg-ink-soft p-3 shadow-stamp-sm transition-[transform,box-shadow] hover:-translate-y-0.5 active:translate-y-0 " +
        (dragging ? "opacity-40" : "")
      }
    >
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center border border-cream/40 bg-acid/90 font-display text-xs font-semibold text-ink-deep">
          {initials(lead)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-cream">
            {lead.name || lead.email}
          </p>
          {lead.name && (
            <p className="truncate text-xs text-cream/50">{lead.email}</p>
          )}
          {companyName(lead) && (
            <p className="truncate text-xs text-cream/50">{companyName(lead)}</p>
          )}
        </div>
      </div>

      {/* Next action / overdue badge */}
      {due !== null && (
        <div className="mt-2.5">
          <span
            className={
              "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
              (due < 0
                ? "border-rose-500/60 bg-rose-500/10 text-rose-500"
                : due === 0
                ? "border-acid/60 bg-acid/10 text-acid"
                : "border-cream/25 text-cream/60")
            }
            title={lead.nextActionNote || formatDate(lead.nextAction)}
          >
            {due < 0
              ? `Overdue ${-due}d`
              : due === 0
              ? "Due today"
              : `Due in ${due}d`}
          </span>
        </div>
      )}

      {/* Footer: platform + last touch */}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-cream/10 pt-2">
        <span className="truncate text-[11px] text-cream/45">
          {lead.platform || "No platform"}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-cream/40">
          {last ? relativeTime(last.at) : relativeTime(lead.createdTime)}
        </span>
      </div>
    </article>
  );
}
