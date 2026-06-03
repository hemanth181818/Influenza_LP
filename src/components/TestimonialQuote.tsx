import { useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";

type SignupStatus = "idle" | "submitting" | "success" | "error";

export default function TestimonialQuote() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source: "landing-cta" }),
      });
      const data: { ok?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <section
      id="signup"
      className="relative py-16 sm:py-32 overflow-hidden bg-ink grain"
    >
      <div
        aria-hidden="true"
        className="absolute -bottom-56 sm:-bottom-72 left-1/2 -translate-x-1/2 w-[380px] h-[380px] sm:w-[760px] sm:h-[760px] rounded-full bg-acid"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-56 sm:-bottom-72 left-1/2 -translate-x-1/2 w-[380px] h-[380px] sm:w-[760px] sm:h-[760px] rounded-full halftone opacity-25 mix-blend-multiply"
      />

      <div className="relative z-10 w-full max-w-[1320px] mx-auto px-4 sm:px-8">
        {/* Section header */}
        <header className="max-w-3xl mb-10 sm:mb-14 reveal-on-scroll">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-4">
            06 · Your new Monday
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
            The work you used to do all week,{" "}
            <span
              className="text-acid"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
            >
              done before lunch.
            </span>
          </h2>
        </header>

        {/* Before / After contrast — magazine spread */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 reveal-on-scroll max-w-5xl">
          {/* BEFORE */}
          <article className="relative bg-paper-soft border-2 border-cream p-5 sm:p-9 shadow-stamp-sm">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-cream/55 mb-5">
              Before Influenza
            </p>
            <ul className="space-y-3 text-cream/85">
              <li className="flex items-baseline gap-3">
                <span className="text-cream/40 font-mono text-sm">×</span>
                <span className="text-[16px] leading-[1.5] line-through decoration-cream/50">
                  A 47-row spreadsheet of creator handles and DMs.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-cream/40 font-mono text-sm">×</span>
                <span className="text-[16px] leading-[1.5] line-through decoration-cream/50">
                  Three Slack threads to ask who got which barter.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-cream/40 font-mono text-sm">×</span>
                <span className="text-[16px] leading-[1.5] line-through decoration-cream/50">
                  A question from finance you can't quite answer.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-cream/40 font-mono text-sm">×</span>
                <span className="text-[16px] leading-[1.5] line-through decoration-cream/50">
                  A standup that runs forty minutes long.
                </span>
              </li>
            </ul>
            <div className="mt-7 pt-5 border-t-2 border-cream/40 border-dashed">
              <p
                className="font-display italic text-cream/60 text-xl"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Total: half your week.
              </p>
            </div>
          </article>

          {/* AFTER */}
          <article className="relative bg-acid border-2 border-cream p-5 sm:p-9 shadow-stamp">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-cream/70 mb-5">
              ★ With Influenza
            </p>
            <ul className="space-y-3 text-cream">
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-cream/80 text-sm">↳</span>
                <span className="text-[16px] leading-[1.5] font-medium">
                  One dashboard. Every creator, every campaign.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-cream/80 text-sm">↳</span>
                <span className="text-[16px] leading-[1.5] font-medium">
                  Approve four moves: products, creators, shipments, codes.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-cream/80 text-sm">↳</span>
                <span className="text-[16px] leading-[1.5] font-medium">
                  Tell finance the exact rupee each creator drove.
                </span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-mono text-cream/80 text-sm">↳</span>
                <span className="text-[16px] leading-[1.5] font-medium">
                  Close the tab. Get a coffee.
                </span>
              </li>
            </ul>
            <div className="mt-7 pt-5 border-t-2 border-cream/40 border-dashed">
              <p
                className="font-display italic text-cream text-xl"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Total: one tab, one hour.
              </p>
            </div>
          </article>
        </div>

        {/* Final CTA — cleanly aligned */}
        <div className="mt-14 sm:mt-24 reveal-on-scroll">
          <div className="bg-paper-soft border-2 border-cream shadow-stamp p-4 sm:p-12 lg:p-14 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-end">
              <div className="lg:col-span-7 min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid mb-5">
                  Start free
                </p>
                <h3
                  className="font-display text-cream tracking-[-0.03em] break-words"
                  style={{
                    fontSize: "clamp(1.6rem, 6vw, 4.4rem)",
                    lineHeight: 1.05,
                    fontWeight: 600,
                  }}
                >
                  Run your first creator campaign{" "}
                  <span
                    className="text-acid"
                    style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400 }}
                  >
                    this week.
                  </span>
                </h3>
                <p className="mt-5 max-w-xl text-[17px] leading-[1.55] text-cream/80">
                  Spin up your Influenza workspace in two minutes. Connect your
                  store, plug in Creator Marketplace and GoAffPro, and ship.
                </p>
              </div>

              <div className="lg:col-span-5 min-w-0 w-full flex flex-col items-stretch lg:items-end gap-3">
                <form
                  onSubmit={handleSignup}
                  noValidate
                  className="block w-full max-w-full overflow-hidden border-2 border-cream bg-cream sm:shadow-stamp sm:flex sm:flex-row sm:items-stretch"
                  aria-busy={status === "submitting"}
                >
                  <label htmlFor="cta-email" className="sr-only">
                    Work email
                  </label>
                  <input
                    id="cta-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    disabled={status === "submitting" || status === "success"}
                    placeholder="you@brand.com"
                    className="block w-full max-w-full min-w-0 flex-1 bg-cream px-4 sm:px-6 py-4 sm:py-0 sm:h-[68px] text-[16px] text-ink placeholder:text-ink/45 focus:outline-none border-b-2 sm:border-b-0 border-cream/30 box-border disabled:opacity-70"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting" || status === "success"}
                    className="group/btn block w-full max-w-full sm:w-auto sm:flex-shrink-0 box-border bg-acid border-t-2 sm:border-t-0 sm:border-l-2 border-cream px-5 sm:px-6 py-4 sm:py-0 sm:h-[68px] text-[13px] font-semibold uppercase tracking-[0.18em] text-cream hover:bg-acid/95 focus-visible:outline-none inline-flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:hover:bg-acid"
                  >
                    {status === "submitting" ? (
                      <>
                        Submitting
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      </>
                    ) : status === "success" ? (
                      <>
                        You're in
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Start free
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Status messages */}
                <p
                  className="font-mono text-[11px] uppercase tracking-[0.18em] min-h-[1.25em]"
                  aria-live="polite"
                >
                  {status === "success" && (
                    <span className="text-acid">
                      ★ Check your inbox — we'll be in touch shortly.
                    </span>
                  )}
                  {status === "error" && (
                    <span className="text-coral">
                      {errorMsg || "Something went wrong. Please try again."}
                    </span>
                  )}
                </p>
                <a
                  href="mailto:hello@influenza.app"
                  className="inline-flex items-baseline gap-2 px-1 py-2 text-cream/80 hover:text-cream transition-colors min-h-[44px]"
                >
                  <span
                    className="text-lg italic"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    or, book a demo
                  </span>
                  <span className="font-mono text-acid">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
