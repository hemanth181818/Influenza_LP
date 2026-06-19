import { useState } from "react";
import { login } from "@/lib/crm";

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center px-5 bg-ledger">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="eyebrow-acid mb-3">Influenza · Internal</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Lead <span className="display-italic text-acid">pipeline</span>
          </h1>
          <p className="mt-2 text-sm text-cream/60">
            Enter the team password to continue.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="border-2 border-cream/80 bg-ink-soft p-5 shadow-stamp"
        >
          <label className="eyebrow mb-2 block">Password</label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-cream/30 bg-ink px-3 py-2.5 text-cream outline-none focus:border-acid transition-colors"
            placeholder="••••••••"
          />

          {error && (
            <p className="mt-3 text-sm text-rose-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy || !password}
            className="mt-4 w-full border-2 border-cream bg-acid text-ink-deep font-semibold uppercase tracking-[0.12em] text-sm py-3 shadow-stamp stamp-lift disabled:opacity-50 disabled:pointer-events-none"
          >
            {busy ? "Checking…" : "Enter pipeline"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-cream/40 font-mono uppercase tracking-[0.18em]">
          Authorised users only
        </p>
      </div>
    </div>
  );
}
