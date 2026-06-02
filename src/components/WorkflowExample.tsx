import { CheckCircle2 } from "lucide-react";

const BRIEF = {
  question:
    "Which products need a creator push this month, and who should we ship to first?",
  diagnostic: [
    { v: "62d", note: "Stock holding · 2.4× target" },
    { v: "₹3.8L", note: "Budget remaining" },
    { v: "14", note: "Matching creators" },
  ],
  matched: [
    { handle: "@nidhi.rao", platform: "IG", followers: "184k", engagement: "5.2%" },
    { handle: "@theshortdesk", platform: "YT", followers: "112k", engagement: "6.1%" },
    { handle: "@ayaan.builds", platform: "IG", followers: "92k", engagement: "4.7%" },
  ],
};

const ACTIONS = [
  {
    n: "01",
    label: "Product",
    title: "Push 3 slow-moving SKUs",
    body: "Keyboard, desk mat, dock. Your three highest-DOH products with the most inventory value at risk this month.",
    cta: "Approve push",
  },
  {
    n: "02",
    label: "Scouting",
    title: "Shortlist 6 audience-fit creators",
    body: "Filtered by India IG, 80k–400k followers, 4%+ engagement and prior tech-vertical posts. Pulled from Creator Marketplace.",
    cta: "Approve shortlist",
  },
  {
    n: "03",
    label: "Shipping",
    title: "Dispatch barter units via BlueDart",
    body: "Pre-fill carrier and tracking, target TAT under 72 hours. Each creator gets a confirmation with their unit on the way.",
    cta: "Approve dispatch",
  },
  {
    n: "04",
    label: "Affiliate",
    title: "Generate GoAffPro codes",
    body: "A unique affiliate code per creator. Attribution wires into the dashboard the moment the first order lands.",
    cta: "Approve codes",
  },
];

export default function WorkflowExample() {
  return (
    <section
      id="example"
      className="relative py-16 sm:py-32 px-5 sm:px-6 overflow-hidden bg-paper-deep grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-40" />

      <div className="container relative z-10 mx-auto">
        {/* Section header */}
        <header className="max-w-3xl mb-12 sm:mb-20 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            03 · Live demo
          </p>
          <h2
            className="font-display text-cream"
            style={{
              fontSize: "clamp(1.85rem, 5.2vw, 4.6rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontWeight: 600,
            }}
          >
            From a question to a campaign,{" "}
            <span
              className="text-acid"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              in minutes.
            </span>
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-cream/75">
            Ask Influenza which products to push. It returns a coordinated
            plan. SKUs prioritized, creators shortlisted, shipments queued,
            affiliate codes ready. You approve each step.
          </p>
        </header>

        {/* Brief + approval queue */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Brief card */}
          <article className="col-span-12 lg:col-span-7 bg-paper border-2 border-cream shadow-stamp reveal-on-scroll">
            <header className="flex items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 border-b-2 border-cream">
              <span className="font-mono text-[9px] sm:text-[10.5px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-cream/65 truncate">
                Brief · session 0x42c
              </span>
              <span className="font-mono text-[9px] sm:text-[10.5px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-acid shrink-0">
                09:14 · today
              </span>
            </header>

            <div className="p-5 sm:p-8">
              <p className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-cream/60 mb-3">
                You asked
              </p>
              <p
                className="font-display text-cream tracking-[-0.02em]"
                style={{
                  fontSize: "clamp(1.2rem, 2.6vw, 2.1rem)",
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                <span
                  className="text-acid mr-1"
                  style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
                >
                  “
                </span>
                {BRIEF.question}
                <span
                  className="text-acid ml-1"
                  style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
                >
                  ”
                </span>
              </p>

              <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/60 mb-3">
                Influenza found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-2 border-cream divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-cream">
                {BRIEF.diagnostic.map((d) => (
                  <div key={d.note} className="p-4 sm:p-5 flex sm:block items-baseline justify-between gap-4 sm:text-center">
                    <div
                      className="font-display text-acid leading-none tabular shrink-0"
                      data-tabular
                      style={{
                        fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                        fontWeight: 700,
                      }}
                    >
                      {d.v}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-cream/65 leading-tight sm:mt-2 text-right sm:text-center">
                      {d.note}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/60 mb-3">
                Top creator matches
              </p>
              <ul className="divide-y-2 divide-cream border-2 border-cream">
                {BRIEF.matched.map((c) => (
                  <li
                    key={c.handle}
                    className="flex items-center justify-between gap-3 bg-paper-soft px-3 sm:px-4 py-3"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="shrink-0 grid place-items-center h-7 w-7 sm:h-8 sm:w-8 bg-acid border-2 border-cream font-mono text-[9px] sm:text-[10px] text-cream font-bold">
                        {c.platform}
                      </span>
                      <span
                        className="font-display text-cream text-[15px] sm:text-lg truncate"
                        style={{ fontWeight: 500 }}
                      >
                        {c.handle}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center gap-2.5 sm:gap-5 font-mono text-[10px] sm:text-[11px] text-cream/75">
                      <span className="tabular" data-tabular>{c.followers}</span>
                      <span className="tabular font-semibold text-mint" data-tabular>
                        {c.engagement}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Approval queue */}
          <div className="col-span-12 lg:col-span-5 reveal-on-scroll">
            <div className="flex items-end justify-between gap-3 pb-3 mb-5 border-b-2 border-cream">
              <h3
                className="font-display text-cream text-2xl"
                style={{ fontWeight: 600 }}
              >
                Approval queue
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-acid tabular" data-tabular>
                04 pending
              </span>
            </div>

            <ol className="space-y-3 sm:space-y-3.5">
              {ACTIONS.map((a) => (
                <li key={a.title}>
                  <article className="group bg-paper border-2 border-cream p-4 sm:p-5 shadow-stamp-sm hover:translate-x-[-2px] transition-transform flex items-start gap-3 sm:gap-4">
                    <span
                      className="font-display text-acid leading-none tabular shrink-0"
                      data-tabular
                      style={{ fontSize: "1.6rem", fontWeight: 700 }}
                    >
                      {a.n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55 mb-1">
                        {a.label}
                      </p>
                      <h4
                        className="font-display text-cream text-[17px] leading-tight"
                        style={{ fontWeight: 600 }}
                      >
                        {a.title}
                      </h4>
                      <p className="mt-1.5 text-[13.5px] leading-[1.55] text-cream/75">
                        {a.body}
                      </p>
                      <button
                        type="button"
                        className="mt-3.5 inline-flex items-center gap-2 bg-ink border-2 border-cream px-3 py-1.5 min-h-[36px] text-xs font-mono uppercase tracking-[0.18em] text-cream hover:bg-acid stamp-lift shadow-stamp-sm focus-visible:outline-none"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {a.cta}
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
