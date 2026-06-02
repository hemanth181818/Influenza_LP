"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  prefix?: string;
  value: number;
  suffix: string;
  label: string;
  caption: string;
  duration: number;
};

const STATS: Stat[] = [
  {
    value: 1,
    suffix: "",
    label: "platform replaces nine tools",
    caption: "Scouting, campaigns, shipments, attribution, under one login",
    duration: 900,
  },
  {
    value: 8,
    suffix: "",
    label: "modules out of the box",
    caption: "Every step from first DM to last rupee, built in",
    duration: 1100,
  },
  {
    value: 100,
    suffix: "%",
    label: "approval-gated by default",
    caption: "Nothing dispatches, posts or pays without you",
    duration: 1400,
  },
  {
    prefix: "<",
    value: 2,
    suffix: " min",
    label: "to launch your workspace",
    caption: "Connect your store and ship your first campaign this week",
    duration: 1000,
  },
];

function Counter({ target, duration, isVisible }: { target: number; duration: number; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(target);
      return;
    }
    let raf: number;
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.floor(eased * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(step);
    }, 250);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, isVisible]);

  return <span>{count}</span>;
}

export default function StatsSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-32 px-5 sm:px-6 overflow-hidden bg-paper-deep grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-40" />

      <div className="container relative z-10 mx-auto">
        {/* Section header */}
        <header className="max-w-3xl mb-12 sm:mb-20 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            05 · By the numbers
          </p>
          <h2
            className="font-display text-cream"
            style={{
              fontSize: "clamp(2.2rem, 5.2vw, 4.6rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.03em",
              fontWeight: 600,
            }}
          >
            What you get,{" "}
            <span
              className="text-acid"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              in plain numbers.
            </span>
          </h2>
        </header>

        {/* Compact 4-up vertical stat grid — number stacked on top of label */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t-2 border-cream reveal-on-scroll"
        >
          {STATS.map((s, idx) => (
            <div
              key={s.label}
              className={[
                "flex flex-col py-8 sm:py-10 px-5 sm:px-6 border-b-2 border-cream",
                // vertical dividers between columns (hidden on the last in row)
                "sm:[&:nth-child(odd)]:border-r-2 sm:[&:nth-child(odd)]:border-cream",
                "lg:!border-r-2 lg:last:!border-r-0 lg:border-cream",
                "group",
              ].join(" ")}
            >
              {/* index */}
              <span
                className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-acid tabular mb-5"
                data-tabular
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* number */}
              <div
                className="font-display text-cream leading-[0.85] tabular flex items-baseline gap-1"
                data-tabular
                style={{ fontSize: "clamp(2.6rem, 4.6vw, 4rem)", fontWeight: 700 }}
              >
                {s.prefix && (
                  <span
                    className="text-acid"
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontWeight: 400,
                      fontStyle: "italic",
                    }}
                  >
                    {s.prefix}
                  </span>
                )}
                <Counter target={s.value} duration={s.duration} isVisible={visible} />
                <span
                  className="text-acid"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontWeight: 400,
                    fontStyle: "italic",
                  }}
                >
                  {s.suffix}
                </span>
              </div>

              {/* label + caption */}
              <div className="mt-5">
                <div
                  className="font-display text-cream text-lg sm:text-xl leading-snug"
                  style={{ fontWeight: 500 }}
                >
                  {s.label}
                </div>
                <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/60 leading-relaxed">
                  {s.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
