const SYSTEMS = [
  "Creator Marketplace",
  "Instagram",
  "YouTube",
  "Shopify",
  "GoAffPro",
  "BlueDart",
  "Delhivery",
  "Razorpay",
  "Google Sheets",
  "WhatsApp Business",
];

export default function LogoMarquee() {
  const items = [...SYSTEMS, ...SYSTEMS];

  return (
    <section className="relative py-10 sm:py-12 bg-ink border-y-2 border-cream overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-cream/60 mb-4 text-center">
          Works with the tools you already use
        </p>

        <div className="marquee-mask overflow-hidden">
          <div
            className="flex w-max animate-marquee gap-12 sm:gap-16 will-change-transform"
            style={{ animationDirection: "reverse" }}
          >
            {items.map((sys, idx) => (
              <span
                key={`${sys}-${idx}`}
                className="inline-flex items-baseline gap-3 whitespace-nowrap"
              >
                <span className="font-mono text-[10px] tabular text-acid" data-tabular>
                  {String((idx % SYSTEMS.length) + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-cream text-2xl sm:text-3xl tracking-[-0.015em]" style={{ fontWeight: 500 }}>
                  {sys}
                </span>
                <span className="font-display italic text-acid text-2xl sm:text-3xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
