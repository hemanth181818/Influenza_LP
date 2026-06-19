import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { STAGES, type Lead, type Stage } from "@/lib/crm";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

// Brand palette — the CRM runs on light bone paper with deep-ink text.
const PAPER = "#F5EFE3";
const INK = "#2E1023";
const ACID = "#FB5424";
const TEXT = "rgba(46,16,35,0.62)";
const GRID = "rgba(46,16,35,0.08)";

// Warm, editorial, on-paper stage colours (not the cold default 500s).
const STAGE_COLOR: Record<Stage, string> = {
  New: "#B7A992",
  Contacted: "#3E7CB1",
  "Call Booked": "#E0992E",
  "Call Done": "#8E6FC9",
  Qualified: "#FB5424",
};

const DAYS = 14;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Draws the total + label in the middle of the doughnut.
function centerTextPlugin(total: number): Plugin<"doughnut"> {
  return {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const cx = (chartArea.left + chartArea.right) / 2;
      const cy = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = INK;
      ctx.font = "600 30px Fraunces, Georgia, serif";
      ctx.fillText(String(total), cx, cy - 6);
      ctx.fillStyle = TEXT;
      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.fillText("LEADS", cx, cy + 14);
      ctx.restore();
    },
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-cream/55">
      {children}
    </p>
  );
}

export default function Overview({ leads }: { leads: Lead[] }) {
  const { days, byStage, total, thisWeek } = useMemo(() => {
    const counts = new Map<string, number>();
    const stageCounts = {} as Record<Stage, number>;
    for (const s of STAGES) stageCounts[s] = 0;

    const weekAgo = Date.now() - 7 * 86_400_000;
    let week = 0;

    for (const l of leads) {
      stageCounts[l.stage]++;
      const d = new Date(l.createdTime);
      if (!Number.isNaN(d.getTime())) {
        counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);
        if (d.getTime() >= weekAgo) week++;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { label: string; count: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      out.push({
        label: d.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        }),
        count: counts.get(dayKey(d)) ?? 0,
      });
    }
    return { days: out, byStage: stageCounts, total: leads.length, thisWeek: week };
  }, [leads]);

  const barData = {
    labels: days.map((d) => d.label),
    datasets: [
      {
        label: "Signups",
        data: days.map((d) => d.count),
        backgroundColor: ACID,
        hoverBackgroundColor: "#ff6a3d",
        borderRadius: 4,
        maxBarThickness: 28,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: INK,
        titleColor: PAPER,
        bodyColor: PAPER,
        padding: 10,
        cornerRadius: 2,
        displayColors: false,
        titleFont: { family: "JetBrains Mono", size: 10 },
        bodyFont: { family: "Bricolage Grotesque", size: 12 },
        callbacks: {
          label: (c) => `${c.parsed.y} signup${c.parsed.y === 1 ? "" : "s"}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: GRID },
        ticks: {
          color: TEXT,
          font: { size: 11, family: "JetBrains Mono" },
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID },
        border: { display: false },
        ticks: {
          color: TEXT,
          precision: 0,
          stepSize: 1,
          font: { size: 11, family: "JetBrains Mono" },
        },
      },
    },
  };

  const activeStages = STAGES.filter((s) => byStage[s] > 0);
  const doughnutData = {
    labels: activeStages,
    datasets: [
      {
        data: activeStages.map((s) => byStage[s]),
        backgroundColor: activeStages.map((s) => STAGE_COLOR[s]),
        borderColor: PAPER,
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: INK,
        titleColor: PAPER,
        bodyColor: PAPER,
        padding: 10,
        cornerRadius: 2,
        bodyFont: { family: "Bricolage Grotesque", size: 12 },
        callbacks: {
          label: (c) => {
            const pct = total ? Math.round((c.parsed / total) * 100) : 0;
            return ` ${c.parsed} · ${pct}%`;
          },
        },
      },
    },
  };

  const cards: { label: string; value: number; dot?: string; accent?: boolean }[] =
    [
      { label: "Total signups", value: total, accent: true },
      ...STAGES.map((s) => ({ label: s, value: byStage[s], dot: STAGE_COLOR[s] })),
    ];

  return (
    <div className="space-y-3 px-4 pb-3 pt-3 sm:px-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={
              "border-2 px-3 py-2.5 " +
              (c.accent
                ? "border-cream bg-acid/10 shadow-stamp-sm"
                : "border-cream/15 bg-ink-soft/50")
            }
          >
            <div className="flex items-center gap-1.5">
              {c.dot && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: c.dot }}
                />
              )}
              <span className="truncate text-[11px] font-medium text-cream/55">
                {c.label}
              </span>
            </div>
            <p
              className={
                "mt-1.5 font-display text-[28px] font-semibold leading-none " +
                (c.value === 0 && !c.accent ? "text-cream/25" : "text-cream")
              }
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="border-2 border-cream/15 bg-ink-soft/50 p-4 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <SectionLabel>Signups per day</SectionLabel>
            <p className="text-[11px] text-cream/45">
              <span className="font-display text-base font-semibold text-acid">
                {thisWeek}
              </span>{" "}
              in last 7 days
            </p>
          </div>
          <div className="h-44">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="border-2 border-cream/15 bg-ink-soft/50 p-4">
          <SectionLabel>Pipeline breakdown</SectionLabel>
          {activeStages.length ? (
            <div className="mt-2 flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <Doughnut
                  data={doughnutData}
                  options={doughnutOptions}
                  plugins={[centerTextPlugin(total)]}
                />
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5">
                {activeStages.map((s) => {
                  const pct = total ? Math.round((byStage[s] / total) * 100) : 0;
                  return (
                    <li key={s} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ background: STAGE_COLOR[s] }}
                      />
                      <span className="flex-1 truncate text-cream/75">{s}</span>
                      <span className="font-display text-sm font-semibold text-cream">
                        {byStage[s]}
                      </span>
                      <span className="w-8 text-right font-mono text-[10px] text-cream/40">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="grid h-40 place-items-center text-sm text-cream/40">
              No data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
