import { useState } from "react";
import { STAGES, STAGE_META, type Lead, type Stage } from "@/lib/crm";
import LeadCard from "./LeadCard";

interface Props {
  leads: Lead[];
  onOpen: (id: string) => void;
  onMove: (id: string, stage: Stage) => void;
}

export default function Board({ leads, onOpen, onMove }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const byStage: Record<Stage, Lead[]> = {
    New: [],
    Contacted: [],
    "Call Booked": [],
    "Call Done": [],
    Qualified: [],
  };
  for (const lead of leads) byStage[lead.stage].push(lead);

  function drop(stage: Stage) {
    if (dragId) {
      const lead = leads.find((l) => l.id === dragId);
      if (lead && lead.stage !== stage) onMove(dragId, stage);
    }
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div className="flex h-full gap-3 overflow-x-auto px-4 pb-4 sm:px-6">
      {STAGES.map((stage) => {
        const items = byStage[stage];
        const isOver = overStage === stage;
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              if (overStage !== stage) setOverStage(stage);
            }}
            onDragLeave={(e) => {
              // Only clear when truly leaving the column.
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setOverStage((s) => (s === stage ? null : s));
            }}
            onDrop={() => drop(stage)}
            className={
              "flex w-[15.5rem] shrink-0 flex-col border-2 transition-colors " +
              (isOver
                ? "border-acid bg-acid/5"
                : "border-cream/15 bg-ink/40")
            }
          >
            {/* Column header */}
            <div className="sticky top-0 flex items-center justify-between gap-2 border-b-2 border-cream/15 bg-ink/80 px-3 py-2 backdrop-blur">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${STAGE_META[stage].dot}`}
                />
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-cream/80">
                  {stage}
                </span>
              </div>
              <span className="font-mono text-[11px] text-cream/40">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
              {items.length === 0 ? (
                <p className="px-1 py-6 text-center text-[11px] text-cream/30">
                  {isOver ? "Drop here" : "Empty"}
                </p>
              ) : (
                items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    dragging={dragId === lead.id}
                    onDragStart={() => setDragId(lead.id)}
                    onOpen={() => onOpen(lead.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
