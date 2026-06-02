import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * Editorial magazine cover.
 * Asymmetric: large Fraunces masthead on the left, "In this issue" TOC on the
 * right, tangerine arc pinned behind. Paper texture + dotted ledger.
 */

const ROTATING = [
  "47-row barter sheet.",
  "WhatsApp approval chain.",
  "guess-the-rupee report.",
  "DM-and-pray attribution.",
  "40-minute standup.",
];

const TOC = [
  { n: "01", title: "Creator Marketplace", caption: "Scout from one place", href: "#agents" },
  { n: "02", title: "Inventory-driven push", caption: "DOH, DRR, value at risk", href: "#system" },
  { n: "03", title: "Approval queue", caption: "Nothing ships without you", href: "#example" },
  { n: "04", title: "Affiliate attribution", caption: "Prove the rupee", href: "#system" },
];

export default function Hero() {
  const [i, setI] = useState(0);
  const titles = useMemo(() => ROTATING, []);

  useEffect(() => {
    const t = setTimeout(() => setI((p) => (p + 1) % titles.length), 2600);
    return () => clearTimeout(t);
  }, [i, titles.length]);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] overflow-hidden bg-ink grain"
    >
      {/* Tangerine sun, top-right */}
      <div
        aria-hidden="true"
        className="absolute -top-56 -right-56 sm:-top-48 sm:-right-40 w-[560px] h-[560px] rounded-full bg-acid opacity-95 lg:opacity-85"
      />
      <div
        aria-hidden="true"
        className="absolute -top-56 -right-56 sm:-top-48 sm:-right-40 w-[560px] h-[560px] rounded-full halftone opacity-25 mix-blend-multiply"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -left-56 w-[380px] h-[380px] rounded-full bg-coral/20 blur-2xl"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-50" />

      {/* Dateline strip */}
      <div className="relative z-10 pt-20 sm:pt-28">
        <div className="container px-5 sm:px-6 mx-auto">
          <div className="flex items-center justify-between gap-4 border-b border-cream/20 pb-3">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-cream/60 truncate">
              The Creator Marketing Quarterly · Issue 01
            </span>
            <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-cream/60 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse" />
              Live · Marketplace integrated
            </span>
          </div>
        </div>
      </div>

      {/* Main editorial grid */}
      <div className="relative z-10 container px-5 sm:px-6 mx-auto pt-8 sm:pt-12 pb-16 sm:pb-28">
        <div className="grid grid-cols-12 gap-x-6 lg:gap-x-12 xl:gap-x-16 gap-y-10">
          {/* LEFT: Masthead headline */}
          <div className="col-span-12 lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.26em] sm:tracking-[0.3em] text-cream/70 mb-6 sm:mb-10"
            >
              <span className="text-acid">★</span> The creator marketing OS
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="font-display text-cream"
              style={{ fontWeight: 600 }}
            >
              <span className="block text-[clamp(2.5rem,9vw,7.5rem)] leading-[0.86] tracking-[-0.04em]">
                Run your
              </span>
              <span className="block text-[clamp(2.5rem,9vw,7.5rem)] leading-[0.86] tracking-[-0.04em]">
                <span
                  className="italic"
                  style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                >
                  creator
                </span>{" "}
                program
              </span>
              <span className="block text-[clamp(1.35rem,4.2vw,2.8rem)] leading-[1.15] tracking-[-0.02em] mt-6 sm:mt-10 text-cream/75">
                <span className="inline-block" style={{ transform: "translateY(-0.14em)" }}>
                  not your
                </span>{" "}
                <span
                  aria-live="polite"
                  className="relative inline-block ml-2 align-baseline overflow-hidden"
                  // Nudge the rotating component so the italic serif
                  // (whose metrics differ from Fraunces) visually sits on
                  // the same baseline as "not your".
                  style={{ transform: "translateY(0.08em)" }}
                >
                  {/* Invisible sizer — establishes baseline + dynamic width using the same font/style as the animated text. */}
                  <span
                    aria-hidden="true"
                    className="invisible whitespace-nowrap italic"
                    style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                  >
                    {titles[i]}
                  </span>
                  {titles.map((t, idx) => (
                    <motion.span
                      key={t}
                      aria-hidden={i !== idx}
                      className="absolute inset-0 whitespace-nowrap italic text-acid"
                      style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
                      initial={{ y: "60%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 90, damping: 18 }}
                      animate={
                        i === idx
                          ? { y: 0, opacity: 1 }
                          : { y: i > idx ? "-80%" : "80%", opacity: 0 }
                      }
                    >
                      {t}
                    </motion.span>
                  ))}
                </span>
              </span>
            </motion.h1>

            {/* Lede paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 sm:mt-16 max-w-xl text-[16px] sm:text-[18px] leading-[1.6] text-cream/75"
            >
              Scout creators from one dashboard. Push the stock your warehouse
              can't move. Approve every collab from one tab. Prove your ROI,
              down to the rupee.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <a
                href="#signup"
                className="group inline-flex justify-center sm:justify-start items-center gap-2.5 bg-acid border-2 border-cream px-7 py-4 text-[13px] sm:text-sm font-semibold uppercase tracking-[0.16em] text-cream stamp-lift shadow-stamp min-h-[56px] focus-visible:outline-none"
              >
                Open the workspace
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#example"
                className="inline-flex justify-center sm:justify-start items-baseline gap-2 text-cream/85 hover:text-cream transition-colors min-h-[44px]"
              >
                <span
                  className="text-lg italic"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  or, see a Monday in motion
                </span>
                <span className="font-mono text-acid">↓</span>
              </a>
            </motion.div>
          </div>

          {/* RIGHT: In this issue */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            id="workflow"
            className="col-span-12 lg:col-span-5 mt-2 lg:mt-24 xl:mt-28"
            aria-label="In this tool"
          >
            <div className="relative bg-paper-soft border-2 border-cream p-6 sm:p-7 shadow-stamp">
              <span
                aria-hidden="true"
                className="absolute -top-3 left-6 px-3 py-1 bg-acid border-2 border-cream font-mono text-[10px] uppercase tracking-[0.22em] text-cream"
                style={{ transform: "rotate(-2deg)" }}
              >
                In this tool
              </span>

              <ul className="mt-4 divide-y divide-cream/15">
                {TOC.map((item) => (
                  <li key={item.n}>
                    <a
                      href={item.href}
                      className="group flex items-baseline gap-4 py-3.5 hover:bg-acid/10 -mx-2 px-2 transition-colors"
                    >
                      <span
                        className="font-display text-acid text-2xl leading-none tabular"
                        data-tabular
                        style={{ fontWeight: 600 }}
                      >
                        {item.n}
                      </span>
                      <span className="flex-1">
                        <span
                          className="block font-display text-cream text-[17px] leading-tight group-hover:underline"
                          style={{ fontWeight: 500 }}
                        >
                          {item.title}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-cream/55 mt-1">
                          {item.caption}
                        </span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-cream/40 group-hover:text-acid transition-colors" />
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t-2 border-cream/80 border-dashed flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/60">
                  8 modules · one workflow
                </span>
                <span
                  className="font-display italic text-cream text-base"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  pg. 1 of 9
                </span>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Scout / Push / Measure tri-strip */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 border-2 border-cream divide-y-2 md:divide-y-0 md:divide-x-2 divide-cream bg-paper-soft">
          {[
            { k: "Scout", v: "from one creator marketplace", n: "I." },
            { k: "Push", v: "the stock your warehouse can't move", n: "II." },
            { k: "Measure", v: "every rupee, via GoAffPro", n: "III." },
          ].map((item) => (
            <div key={item.k} className="p-5 sm:p-7 flex items-baseline gap-4">
              <span
                className="font-display text-acid text-3xl leading-none"
                style={{ fontWeight: 700 }}
              >
                {item.n}
              </span>
              <div>
                <div
                  className="font-display text-cream text-2xl sm:text-3xl leading-tight"
                  style={{ fontWeight: 600 }}
                >
                  {item.k}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/65 mt-1">
                  {item.v}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
