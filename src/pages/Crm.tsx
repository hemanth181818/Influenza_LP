import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AuthError,
  fetchLeads,
  logout,
  patchLead,
  logActivity,
  sendLeadEmail,
  daysUntil,
  STAGES,
  STAGE_META,
  type Lead,
  type LeadPatch,
  type Stage,
} from "@/lib/crm";
import Login from "@/components/crm/Login";
import Board from "@/components/crm/Board";
import LeadTable from "@/components/crm/LeadTable";
import LeadDrawer from "@/components/crm/LeadDrawer";
import Overview from "@/components/crm/Overview";

type AuthState = "loading" | "out" | "in";
type View = "table" | "board";
type StageFilter = Stage | "all";

export default function Crm() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState(false);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<View>(() =>
    typeof localStorage !== "undefined" && localStorage.getItem("crm.view") === "board"
      ? "board"
      : "table"
  );
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  function changeView(v: View) {
    setView(v);
    try {
      localStorage.setItem("crm.view", v);
    } catch {
      /* ignore */
    }
  }

  function openLead(id: string) {
    setEmailMode(false);
    setSelectedId(id);
  }

  function openEmail(id: string) {
    setEmailMode(true);
    setSelectedId(id);
  }

  function closeDrawer() {
    setSelectedId(null);
    setEmailMode(false);
  }

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setRefreshing(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
      setAuth("in");
      if (!silent) setError("");
    } catch (err) {
      if (err instanceof AuthError) {
        setAuth("out");
      } else if (!silent) {
        // Ignore transient errors on background polls; only surface manual ones.
        setError(err instanceof Error ? err.message : "Failed to load.");
        setAuth("in");
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-refresh: poll every 30s, and refetch instantly when the tab regains
  // focus — so new signups appear without anyone hitting refresh.
  useEffect(() => {
    if (auth !== "in") return;
    const id = window.setInterval(() => void load({ silent: true }), 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load({ silent: true });
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [auth, load]);

  // Optimistic local update + server sync. Reverts on failure.
  const applyLead = useCallback((updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const handlePatch = useCallback(
    async (id: string, patch: LeadPatch) => {
      const before = leads.find((l) => l.id === id);
      // Optimistic.
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
      );
      try {
        const fresh = await patchLead(id, patch);
        applyLead(fresh);
      } catch (err) {
        if (before) applyLead(before);
        if (err instanceof AuthError) setAuth("out");
        else setError(err instanceof Error ? err.message : "Update failed.");
      }
    },
    [leads, applyLead]
  );

  const handleActivity = useCallback(
    async (
      id: string,
      input: {
        type: "Call" | "Note" | "Email";
        note: string;
        outcome?: string;
        stage?: Stage;
      }
    ) => {
      try {
        const fresh = await logActivity({ id, ...input });
        applyLead(fresh);
      } catch (err) {
        if (err instanceof AuthError) setAuth("out");
        else setError(err instanceof Error ? err.message : "Could not log.");
      }
    },
    [applyLead]
  );

  const handleEmail = useCallback(
    async (
      id: string,
      input: { subject: string; body: string; cc?: string }
    ) => {
      // Let the drawer surface send errors, so don't swallow them here.
      const fresh = await sendLeadEmail({ id, ...input });
      applyLead(fresh);
    },
    [applyLead]
  );

  async function handleLogout() {
    await logout();
    setAuth("out");
    setLeads([]);
    setSelectedId(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (stageFilter !== "all" && l.stage !== stageFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.company, l.platform, l.notes]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, query, stageFilter]);

  const stageCounts = useMemo(() => {
    const counts = { all: leads.length } as Record<StageFilter, number>;
    for (const s of STAGES) counts[s] = 0;
    for (const l of leads) counts[l.stage]++;
    return counts;
  }, [leads]);

  const stats = useMemo(() => {
    const total = leads.length;
    const qualified = leads.filter((l) => l.stage === "Qualified").length;
    const contacted = leads.filter((l) => l.stage === "Contacted").length;
    const overdue = leads.filter((l) => {
      const d = daysUntil(l.nextAction);
      return d !== null && d < 0;
    }).length;
    return { total, qualified, contacted, overdue };
  }, [leads]);

  const selected = selectedId
    ? leads.find((l) => l.id === selectedId) ?? null
    : null;

  if (auth === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-ink text-cream">
        <p className="animate-pulse font-mono text-xs uppercase tracking-[0.2em] text-cream/50">
          Loading pipeline…
        </p>
      </div>
    );
  }

  if (auth === "out") {
    return <Login onSuccess={() => void load()} />;
  }

  return (
    <div className="flex h-screen flex-col bg-ink text-cream">
      {/* Top bar */}
      <header className="shrink-0 border-b-2 border-cream/15 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-lg font-semibold">
              Lead <span className="display-italic text-acid">pipeline</span>
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/40">
              Influenza
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs">
            <Stat label="Total" value={stats.total} />
            <Stat label="Contacted" value={stats.contacted} />
            <Stat label="Qualified" value={stats.qualified} tone="text-acid" />
            <Stat
              label="Overdue"
              value={stats.overdue}
              tone={stats.overdue ? "text-rose-500" : undefined}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border-2 border-cream/20">
              {(["table", "board"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => changeView(v)}
                  className={
                    "px-2.5 py-1.5 text-xs font-medium capitalize transition-colors " +
                    (view === v
                      ? "bg-cream text-ink"
                      : "text-cream/60 hover:text-cream")
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads…"
              className="w-40 border-2 border-cream/20 bg-ink-soft px-2.5 py-1.5 text-sm text-cream outline-none focus:border-acid sm:w-56"
            />
            <span
              className="flex items-center gap-1.5 border-2 border-cream/15 px-2 py-1.5"
              title="Auto-refreshes every 30s and when you return to the tab"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/45">
                Live
              </span>
            </span>
            <button
              onClick={() => void load()}
              disabled={refreshing}
              className="border-2 border-cream/20 px-2.5 py-1.5 text-xs text-cream/70 hover:border-cream hover:text-cream disabled:opacity-50"
              title="Refresh now"
            >
              {refreshing ? "…" : "↻"}
            </button>
            <button
              onClick={handleLogout}
              className="border-2 border-cream/20 px-2.5 py-1.5 text-xs text-cream/70 hover:border-rose-500 hover:text-rose-500"
            >
              Log out
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-xs text-rose-500">
            {error}{" "}
            <button onClick={() => setError("")} className="underline">
              dismiss
            </button>
          </p>
        )}
      </header>

      {/* Body */}
      <main className="flex min-h-0 flex-1 flex-col">
        {leads.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <p className="font-display text-2xl font-semibold">No leads yet</p>
              <p className="mt-2 text-sm text-cream/50">
                Signups from the landing page will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="shrink-0">
              <Overview leads={leads} />
            </div>

            {/* Stage filter chips */}
            <div className="shrink-0 overflow-x-auto px-4 py-2.5 sm:px-6">
              <div className="flex items-center gap-1.5">
                {(["all", ...STAGES] as StageFilter[]).map((s) => {
                  const active = stageFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStageFilter(s)}
                      className={
                        "flex items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 text-xs font-medium transition-colors " +
                        (active
                          ? "border-cream bg-cream text-ink"
                          : "border-cream/20 text-cream/60 hover:border-cream/50 hover:text-cream")
                      }
                    >
                      {s !== "all" && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STAGE_META[s as Stage].dot}`}
                        />
                      )}
                      <span className="capitalize">{s}</span>
                      <span
                        className={
                          "font-mono text-[10px] " +
                          (active ? "text-ink/60" : "text-cream/35")
                        }
                      >
                        {stageCounts[s]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View */}
            <div className="min-h-0 flex-1">
              {view === "board" ? (
                <Board
                  leads={filtered}
                  onOpen={openLead}
                  onMove={(id, stage) => void handlePatch(id, { stage })}
                />
              ) : (
                <LeadTable
                  leads={filtered}
                  onOpen={openLead}
                  onMove={(id, stage) => void handlePatch(id, { stage })}
                  onPatch={(id, patch) => void handlePatch(id, patch)}
                  onEmail={openEmail}
                />
              )}
            </div>
          </>
        )}
      </main>

      {selected && (
        <LeadDrawer
          key={selected.id + String(emailMode)}
          lead={selected}
          initialEmailOpen={emailMode}
          onClose={closeDrawer}
          onPatch={(patch) => handlePatch(selected.id, patch)}
          onActivity={(input) => handleActivity(selected.id, input)}
          onEmail={(input) => handleEmail(selected.id, input)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`font-display text-base font-semibold ${tone ?? ""}`}>
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/40">
        {label}
      </span>
    </span>
  );
}
