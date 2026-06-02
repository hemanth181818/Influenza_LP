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
      className="relative py-16 sm:py-32 px-5 sm:px-6 overflow-hidden bg-paper-deep grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-40" />

      <div className="container relative z-10 mx-auto">
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
        <div className="grid grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
          <div className="col-span-12 lg:col-span-7 reveal-on-scroll">
            <Card className="relative p-4 sm:p-10 bg-paper-soft border-2 border-cream rounded-none shadow-stamp overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/65">
                  context-graph
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-acid" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-acid">
                    live
                  </span>
                </span>
              </div>

              <KortexCortex className="w-full h-auto" text="I" animateText={false} />

              {/* Corner ticks */}
              <span className="absolute top-3 left-3 h-2.5 w-2.5 border-l-2 border-t-2 border-cream" />
              <span className="absolute top-3 right-3 h-2.5 w-2.5 border-r-2 border-t-2 border-cream" />
              <span className="absolute bottom-3 left-3 h-2.5 w-2.5 border-l-2 border-b-2 border-cream" />
              <span className="absolute bottom-3 right-3 h-2.5 w-2.5 border-r-2 border-b-2 border-cream" />
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-5 reveal-on-scroll">
            <h3
              className="font-display text-cream text-3xl sm:text-4xl leading-[1.05] tracking-[-0.02em]"
              style={{ fontWeight: 600 }}
            >
              Connect once.{" "}
              <span
                className="text-acid"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
              >
                Work in one place.
              </span>
            </h3>
            <p className="mt-5 text-[16px] leading-[1.6] text-cream/75">
              Plug in your store, your shipping carriers and your affiliate
              tracker. Influenza pulls live creator data from Creator
              Marketplace and keeps every team (marketing, ops, finance) on
              the same page.
            </p>

            <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-cream/60 mb-3">
              Native integrations
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Connected sources">
              {SOURCES.map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center gap-2 bg-paper-soft border-2 border-cream px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-cream"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
