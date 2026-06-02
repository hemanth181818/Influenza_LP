"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Users,
  Gauge,
  Package,
  Megaphone,
  Inbox,
  ShieldCheck,
  Truck,
  Banknote,
} from "lucide-react";

const MODULES = [
  {
    icon: Users,
    name: "Creator scouting",
    blurb:
      "Discover and vet creators with live audience, engagement and platform data, straight from Creator Marketplace.",
  },
  {
    icon: Gauge,
    name: "Live dashboard",
    blurb:
      "Views, spend, CPV, platform splits and monthly trends in one screen. Stop exporting CSVs to answer simple questions.",
  },
  {
    icon: Package,
    name: "Smart product push",
    blurb:
      "Influenza ranks every SKU by stock pressure and sell-through, so you push the products that actually need volume.",
  },
  {
    icon: Megaphone,
    name: "Campaign board",
    blurb:
      "Every deliverable in one view: who's posting what, when, paid or barter, scheduled or live. No follow-up DMs.",
  },
  {
    icon: Inbox,
    name: "Inbound creator hub",
    blurb:
      "A public application page collects creators who want to work with you. Triage, accept or reject in clicks.",
  },
  {
    icon: ShieldCheck,
    name: "Approval queue",
    blurb:
      "Every request, submission and outbound move lands in one queue. Approve, reject, capture notes. Keep the audit trail.",
  },
  {
    icon: Truck,
    name: "Shipment tracking",
    blurb:
      "Carrier, tracking number, dispatch time and average TAT. Operations stops being a black box for marketing.",
  },
  {
    icon: Banknote,
    name: "Affiliate revenue",
    blurb:
      "Sync GoAffPro and see exactly which creator drove which order, AOV and rupee, without spreadsheet reconciliation.",
  },
];

export default function AgentsCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;
    const timeout = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 3600);
    return () => clearTimeout(timeout);
  }, [api, current]);

  return (
    <section
      id="agents"
      className="relative py-16 sm:py-32 overflow-hidden bg-ink grain"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-30" />

      <div className="container px-5 sm:px-6 mx-auto">
        {/* Section header */}
        <header className="max-w-3xl mb-12 sm:mb-20 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            02 · What's inside
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
            Every step of the program,{" "}
            <span
              className="text-acid"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              built in.
            </span>
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-cream/75">
            From the moment a creator hits your radar to the moment they drive
            an order, Influenza handles the work. Eight modules that talk to
            each other, so you don't have to.
          </p>
        </header>

        <Carousel
          setApi={setApi}
          className="w-full reveal-on-scroll"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="-ml-5">
            {MODULES.map((m, idx) => {
              const Icon = m.icon;
              return (
                <CarouselItem
                  key={m.name}
                  className="pl-5 md:basis-1/2 lg:basis-1/3"
                >
                  <article className="group relative h-full bg-paper-soft border-2 border-cream shadow-stamp-sm hover:translate-y-[-2px] transition-transform p-6 sm:p-7 flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                      <span
                        className="font-display text-acid leading-none tabular"
                        data-tabular
                        style={{ fontSize: "2.8rem", fontWeight: 700 }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div
                        className="grid place-items-center h-11 w-11 border-2 border-cream bg-ink"
                        aria-hidden="true"
                      >
                        <Icon className="w-5 h-5 text-cream" />
                      </div>
                    </div>

                    <h3
                      className="font-display text-cream text-2xl leading-[1.1] tracking-[-0.015em]"
                      style={{ fontWeight: 600 }}
                    >
                      {m.name}
                    </h3>
                    <p className="mt-3 text-[14.5px] leading-[1.55] text-cream/75">
                      {m.blurb}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="h-px bg-cream/30 w-full" />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/55">
                          Module {String(idx + 1).padStart(2, "0")} / 08
                        </span>
                        <span className="font-mono text-acid text-sm">→</span>
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Numbered pagination */}
        <div className="mt-12 flex items-center justify-center gap-1">
          {MODULES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to module ${idx + 1}`}
              onClick={() => {
                api?.scrollTo(idx);
                setCurrent(idx);
              }}
              className="px-2.5 py-2 min-h-[44px] min-w-[44px] font-mono text-xs"
            >
              <span
                className={`block tabular transition-colors ${
                  current === idx ? "text-acid font-semibold" : "text-cream/40 hover:text-cream/70"
                }`}
                data-tabular
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
