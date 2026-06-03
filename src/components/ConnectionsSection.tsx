import { Card } from "@/components/ui/card";
import { KortexCortex } from "@/components/ui/ai-architecture";

const SOURCES = [
  "Creator Marketplace",
  "Instagram",
  "YouTube",
  "Shopify",
  "GoAffPro",
  "BlueDart",
  "Delhivery",
  "Razorpay",
  "Google Sheets",
];

export default function ConnectionsSection() {
  return (
    <section
      id="connections"
      className="relative py-16 sm:py-32 overflow-hidden bg-paper-deep grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-40" />

      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-4 sm:px-8">
        {/* Section header — consistent pattern */}
        <header className="max-w-3xl mb-12 sm:mb-20 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            01 · The stack
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
            One platform.{" "}
            <span
              className="text-acid"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              Not nine tools.
            </span>
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-cream/75">
            Most teams stitch creator marketing across nine apps and a Slack
            channel. Influenza is a single platform for scouting, campaigns,
            shipments and affiliate revenue, all under one login.
          </p>
        </header>

        {/* Visual + supporting copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 min-w-0 reveal-on-scroll">
            <Card className="relative p-3 sm:p-10 bg-paper-soft border-2 border-cream rounded-none shadow-stamp overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 px-3 sm:px-0">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-cream/65 truncate">
                  context-graph
                </span>
                <span className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-acid" />
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-acid">
                    live
                  </span>
                </span>
              </div>

              <div className="w-full">
                <KortexCortex className="block w-full h-auto" text="I" animateText={false} />
              </div>

              {/* Corner ticks */}
              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 h-2 w-2 sm:h-2.5 sm:w-2.5 border-l-2 border-t-2 border-cream" />
              <span className="absolute top-2 right-2 sm:top-3 sm:right-3 h-2 w-2 sm:h-2.5 sm:w-2.5 border-r-2 border-t-2 border-cream" />
              <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 h-2 w-2 sm:h-2.5 sm:w-2.5 border-l-2 border-b-2 border-cream" />
              <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 h-2 w-2 sm:h-2.5 sm:w-2.5 border-r-2 border-b-2 border-cream" />
            </Card>
          </div>

          <div className="lg:col-span-5 min-w-0 reveal-on-scroll">
            <h3
              className="font-display text-cream leading-[1.1] tracking-[-0.02em] break-words"
              style={{ fontWeight: 600, fontSize: "clamp(1.5rem, 6vw, 2.4rem)" }}
            >
              Connect once.{" "}
              <span
                className="text-acid"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
              >
                Work in one place.
              </span>
            </h3>
            <p className="mt-5 text-[15px] sm:text-[16px] leading-[1.6] text-cream/75">
              Plug in your store, your shipping carriers and your affiliate
              tracker. Influenza pulls live creator data from Creator
              Marketplace and keeps every team (marketing, ops, finance) on
              the same page.
            </p>

            <p className="mt-8 font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-cream/60 mb-3">
              Native integrations
            </p>
            <ul className="flex flex-wrap gap-1.5 sm:gap-2" aria-label="Connected sources">
              {SOURCES.map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center gap-1.5 max-w-full bg-paper-soft border-2 border-cream px-2 sm:px-3 py-1 sm:py-1.5 text-[9.5px] sm:text-[11px] font-mono uppercase tracking-[0.1em] sm:tracking-[0.16em] text-cream"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-acid shrink-0" />
                  <span className="truncate">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
