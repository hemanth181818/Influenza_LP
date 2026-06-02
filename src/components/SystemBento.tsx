"use client";

import React from "react";
import {
  Users,
  ShieldCheck,
  PackageCheck,
  Banknote,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tile = {
  eyebrow: string;
  title: string;
  body: string;
  Icon: React.ComponentType<{ className?: string }>;
  span: string;
  featured?: boolean;
  tint?: "acid" | "plum" | "paper";
};

const TILES: Tile[] = [
  {
    eyebrow: "Scout",
    title: "Find creators where they already are.",
    body:
      "Influenza is wired into Creator Marketplace. Pull live profiles, audience demos and engagement straight into your approval pipeline. No scraping, no third-party scouts, no CSV gymnastics.",
    Icon: Users,
    span: "lg:col-span-7 lg:row-span-2",
    featured: true,
    tint: "acid",
  },
  {
    eyebrow: "Push",
    title: "Promote the SKUs that move the needle.",
    body:
      "Influenza ranks every product by stock pressure, sell-through and inventory value, so marketing pushes what the business actually needs.",
    Icon: PackageCheck,
    span: "lg:col-span-5",
    tint: "paper",
  },
  {
    eyebrow: "Control",
    title: "Approve every move, keep the audit trail.",
    body:
      "Every request, every dispatch, every code waits for human approval. Capture rejection notes. Nothing ships without you.",
    Icon: ShieldCheck,
    span: "lg:col-span-5",
    tint: "paper",
  },
  {
    eyebrow: "Prove",
    title: "Tie every order back to the creator.",
    body:
      "Influenza syncs with GoAffPro. See exactly which creator drove which order, AOV and rupee. Stop guessing what your spend bought.",
    Icon: Banknote,
    span: "lg:col-span-7",
    tint: "plum",
  },
  {
    eyebrow: "Unify",
    title: "One stack. Zero glue code.",
    body:
      "Creator Marketplace, Shopify, GoAffPro, BlueDart, Delhivery. Connect once. Influenza is the operating layer that ties them together.",
    Icon: Layers,
    span: "lg:col-span-12",
    tint: "paper",
  },
];

function bgClass(tint?: string, featured?: boolean) {
  if (featured && tint === "acid") return "bg-acid text-cream";
  if (tint === "plum") return "bg-cream text-ink";
  return "bg-paper-soft text-cream";
}

export default function SystemBento() {
  return (
    <section
      id="system"
      className="relative py-16 sm:py-32 px-5 sm:px-6 overflow-hidden bg-ink grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-30" />

      <div className="container relative z-10 mx-auto">
        {/* Section header */}
        <header className="max-w-3xl mb-12 sm:mb-20 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            04 · Why Influenza
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
            Four things you can't{" "}
            <span
              className="text-acid"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              duct-tape together.
            </span>
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-cream/75">
            Not another influencer CRM. Not another spreadsheet template.
            Influenza is the layer that makes creator marketing run like a real
            business unit.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 reveal-on-scroll">
          {TILES.map((t) => {
            const Icon = t.Icon;
            const isPlum = t.tint === "plum";
            return (
              <article
                key={t.title}
                className={cn(
                  "relative border-2 shadow-stamp-sm p-6 sm:p-8 overflow-hidden",
                  isPlum ? "border-ink" : "border-cream",
                  bgClass(t.tint, t.featured),
                  t.span
                )}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={cn(
                        "grid place-items-center h-12 w-12 border-2",
                        isPlum ? "border-ink bg-acid" : "border-cream",
                        !isPlum && (t.featured ? "bg-ink" : "bg-acid")
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5 text-cream" />
                    </div>
                    <span
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.22em]",
                        isPlum ? "text-ink/75" : "text-cream/75"
                      )}
                    >
                      {t.eyebrow}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      "font-display leading-[1.05] tracking-[-0.02em]",
                      isPlum ? "text-ink" : "text-cream",
                      t.featured
                        ? "text-[clamp(1.9rem,3.4vw,2.8rem)]"
                        : "text-[clamp(1.25rem,2vw,1.6rem)]"
                    )}
                    style={{ fontWeight: 600 }}
                  >
                    {t.title}
                  </h3>

                  <p
                    className={cn(
                      "mt-3 leading-[1.55]",
                      isPlum ? "text-ink/80" : "text-cream/80",
                      t.featured ? "text-[16px] sm:text-[17px]" : "text-[14px]"
                    )}
                  >
                    {t.body}
                  </p>

                  {t.featured && (
                    <div className="mt-auto pt-8 flex items-center gap-3">
                      <span className="h-px w-10 bg-cream/70" />
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream font-semibold">
                        Live integration
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
