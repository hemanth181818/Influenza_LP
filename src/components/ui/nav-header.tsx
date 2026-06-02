"use client";

import { useEffect, useState } from "react";

const links = [
  { num: "01", label: "Stack", href: "#connections" },
  { num: "02", label: "Modules", href: "#agents" },
  { num: "03", label: "Live demo", href: "#example" },
  { num: "04", label: "Why Influenza", href: "#system" },
];

export function NavHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-ink/92 backdrop-blur-md border-b border-cream/15"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand */}
          <a
            href="#top"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Influenza home"
          >
            <span
              aria-hidden="true"
              className="grid place-items-center h-7 w-7 bg-acid border-2 border-cream font-display italic text-cream text-base leading-none"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 500 }}
            >
              I
            </span>
            <span
              className="font-display italic text-2xl leading-none text-cream group-hover:text-acid transition-colors"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 500 }}
            >
              Influenza
            </span>
          </a>

          {/* Numbered editorial links — desktop */}
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative inline-flex items-baseline gap-1.5 px-3 py-2 text-[13px] font-medium text-cream/75 hover:text-cream transition-colors"
                >
                  <span className="font-mono text-[10px] tracking-[0.16em] text-acid">
                    {l.num}
                  </span>
                  <span>{l.label}</span>
                  <span
                    aria-hidden="true"
                    className="absolute left-3 right-3 -bottom-0.5 h-px bg-acid scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile: horizontal scroll */}
          <div className="md:hidden flex-1 overflow-x-auto -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex items-center gap-1 whitespace-nowrap">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-flex items-baseline gap-1.5 px-3 py-2 text-xs font-medium text-cream/75 min-h-[44px]"
                  >
                    <span className="font-mono text-[10px] text-acid">{l.num}</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sign Up — stamped tangerine button */}
          <a
            href="#signup"
            className="shrink-0 inline-flex items-center gap-1.5 bg-acid border-2 border-cream px-4 py-2 text-xs sm:text-sm font-semibold text-cream stamp-lift shadow-stamp-sm min-h-[40px] focus-visible:outline-none"
          >
            Sign up now
            <span aria-hidden="true" className="font-mono">→</span>
          </a>
        </div>
      </div>
      {/* Double rule beneath masthead */}
      {scrolled && (
        <div aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-px bg-cream/10" />
      )}
    </nav>
  );
}
