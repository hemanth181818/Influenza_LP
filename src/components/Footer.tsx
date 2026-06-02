export default function Footer() {
  return (
    <footer className="relative bg-paper-deep border-t-2 border-cream pt-16 pb-10 px-5 sm:px-6 grain">
      <div aria-hidden="true" className="absolute inset-0 bg-ledger opacity-40" />

      <div className="container relative z-10 mx-auto">
        {/* Masthead row */}
        <div className="grid grid-cols-12 gap-6 mb-12 pb-10 border-b-2 border-cream">
          <div className="col-span-12 md:col-span-7">
            <a href="#top" className="inline-flex items-baseline gap-3" aria-label="Influenza, back to top">
              <span
                className="font-display italic text-cream leading-none"
                style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 500, fontFamily: "'Instrument Serif', serif" }}
              >
                Influenza
              </span>
            </a>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-cream/75">
              The all-in-one platform for running creator marketing. Scout,
              push, approve, attribute. One workflow replaces nine.
            </p>
            <a
              href="#signup"
              className="mt-6 inline-flex items-center gap-2 bg-acid border-2 border-cream px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cream stamp-lift shadow-stamp-sm min-h-[44px]"
            >
              Sign up now <span aria-hidden="true">→</span>
            </a>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: "The stack", href: "#connections" },
              { label: "What's inside", href: "#agents" },
              { label: "Live demo", href: "#example" },
              { label: "Why Influenza", href: "#system" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Manifesto", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Press kit", href: "#" },
              { label: "Contact", href: "mailto:hello@influenza.app" },
            ]}
          />
        </div>

        {/* Colophon */}
        <div className="grid grid-cols-12 gap-4 items-baseline">
          <div className="col-span-12 md:col-span-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/70">
              © {new Date().getFullYear()} Influenza · Built for creator-led brands
            </p>
          </div>
          <div className="col-span-12 md:col-span-6 flex flex-wrap gap-x-6 gap-y-1 md:justify-end">
            <a href="#" className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/70 hover:text-acid">
              Privacy
            </a>
            <a href="#" className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/70 hover:text-acid">
              Terms
            </a>
            <a href="#" className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/70 hover:text-acid">
              Security
            </a>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-acid">
              ● Cortex online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="col-span-6 md:col-span-2 lg:col-span-2">
      <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-acid mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="font-display text-cream text-[15px] hover:underline hover:text-acid transition-colors"
              style={{ fontWeight: 500 }}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
