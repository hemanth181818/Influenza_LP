import { useEffect, useState } from "react";
import {
  STAGES,
  STAGE_META,
  PLATFORMS,
  companyName,
  isPersonalEmail,
  initials,
  relativeTime,
  daysUntil,
  formatDate,
  type Lead,
  type LeadPatch,
  type Stage,
} from "@/lib/crm";

interface Props {
  leads: Lead[];
  onOpen: (id: string) => void;
  onMove: (id: string, stage: Stage) => void;
  onPatch: (id: string, patch: LeadPatch) => void;
  onEmail: (id: string) => void;
}

function NextActionCell({ lead }: { lead: Lead }) {
  const due = daysUntil(lead.nextAction);
  if (due === null) return <span className="text-cream/30">—</span>;
  const label =
    due < 0 ? `Overdue ${-due}d` : due === 0 ? "Due today" : `In ${due}d`;
  const tone =
    due < 0
      ? "border-rose-500/60 bg-rose-500/10 text-rose-500"
      : due === 0
      ? "border-acid/60 bg-acid/10 text-acid"
      : "border-cream/25 text-cream/60";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tone}`}
      title={lead.nextActionNote || formatDate(lead.nextAction)}
    >
      {label}
    </span>
  );
}

function NotesCell({
  lead,
  onSave,
}: {
  lead: Lead;
  onSave: (notes: string) => void;
}) {
  const [v, setV] = useState(lead.notes);
  useEffect(() => setV(lead.notes), [lead.id, lead.notes]);
  return (
    <input
      value={v}
      placeholder="Add a note…"
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== lead.notes && onSave(v)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-full min-w-[140px] border-2 border-transparent bg-transparent px-1.5 py-1 text-xs text-cream/80 outline-none transition-colors placeholder:text-cream/25 hover:border-cream/20 focus:border-acid focus:bg-ink"
    />
  );
}

const SELECT_CLASS =
  "cursor-pointer appearance-none border-2 border-cream/25 bg-ink-soft py-1 pr-7 text-xs font-medium text-cream outline-none transition-colors hover:border-cream/50 focus:border-acid";

export default function LeadTable({
  leads,
  onOpen,
  onMove,
  onPatch,
  onEmail,
}: Props) {
  return (
    <div className="h-full overflow-auto px-4 pb-6 sm:px-6">
      <table className="w-full min-w-[1040px] border-separate border-spacing-0">
        <thead className="sticky top-0 z-10">
          <tr className="bg-ink">
            {[
              "Lead",
              "Company",
              "Stage",
              "Platform",
              "Notes",
              "Next action",
              "Last touch",
              "",
            ].map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-cream/15 px-3 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-cream/40"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const last = lead.activity[lead.activity.length - 1];
            const personal = isPersonalEmail(lead) && !lead.company;
            return (
              <tr
                key={lead.id}
                className="group cursor-pointer transition-colors hover:bg-ink-soft/40"
                onClick={() => onOpen(lead.id)}
              >
                {/* Lead — full email always visible */}
                <td className="border-b border-cream/10 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center border border-cream/40 bg-acid/90 font-display text-[11px] font-semibold text-ink-deep">
                      {initials(lead)}
                    </span>
                    <span>
                      {lead.name && (
                        <span className="block text-sm font-semibold text-cream">
                          {lead.name}
                        </span>
                      )}
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className={
                          "block whitespace-nowrap hover:text-acid hover:underline " +
                          (lead.name
                            ? "text-[12px] text-cream/55"
                            : "text-sm font-semibold text-cream")
                        }
                      >
                        {lead.email}
                      </a>
                    </span>
                  </div>
                </td>

                {/* Company — derived from domain when blank */}
                <td className="whitespace-nowrap border-b border-cream/10 px-3 py-2.5 text-sm">
                  <span className={personal ? "italic text-cream/40" : "text-cream/75"}>
                    {companyName(lead) || <span className="text-cream/30">—</span>}
                  </span>
                </td>

                {/* Stage dropdown */}
                <td
                  className="border-b border-cream/10 px-3 py-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative inline-flex items-center">
                    <span
                      className={`pointer-events-none absolute left-2 h-2 w-2 rounded-full ${STAGE_META[lead.stage].dot}`}
                    />
                    <select
                      value={lead.stage}
                      onChange={(e) => onMove(lead.id, e.target.value as Stage)}
                      className={SELECT_CLASS + " pl-6"}
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 text-[9px] text-cream/40">
                      ▼
                    </span>
                  </div>
                </td>

                {/* Platform dropdown */}
                <td
                  className="border-b border-cream/10 px-3 py-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative inline-flex items-center">
                    <select
                      value={lead.platform}
                      onChange={(e) =>
                        onPatch(lead.id, { platform: e.target.value })
                      }
                      className={
                        SELECT_CLASS +
                        " pl-2.5 " +
                        (lead.platform ? "" : "text-cream/40")
                      }
                    >
                      <option value="">—</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 text-[9px] text-cream/40">
                      ▼
                    </span>
                  </div>
                </td>

                {/* Notes — inline editable */}
                <td
                  className="border-b border-cream/10 px-2 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotesCell
                    lead={lead}
                    onSave={(notes) => onPatch(lead.id, { notes })}
                  />
                </td>

                {/* Next action */}
                <td className="border-b border-cream/10 px-3 py-2.5">
                  <NextActionCell lead={lead} />
                </td>

                {/* Last touch */}
                <td className="whitespace-nowrap border-b border-cream/10 px-3 py-2.5 font-mono text-[11px] text-cream/45">
                  {last ? relativeTime(last.at) : relativeTime(lead.createdTime)}
                </td>

                {/* Actions */}
                <td
                  className="border-b border-cream/10 px-3 py-2.5 text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEmail(lead.id)}
                      className="border-2 border-cream/25 px-2 py-1 text-[11px] font-medium text-cream/70 transition-colors hover:border-acid hover:text-acid"
                      title={`Email ${lead.email}`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => onOpen(lead.id)}
                      className="border-2 border-cream/25 px-2 py-1 text-[11px] font-medium text-cream/70 transition-colors hover:border-cream hover:text-cream"
                    >
                      Open
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
