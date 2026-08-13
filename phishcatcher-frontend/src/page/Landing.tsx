import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const ShieldIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2.5l7.5 3v6c0 5-3.2 8.6-7.5 10-4.3-1.4-7.5-5-7.5-10v-6l7.5-3z"
      fill="currentColor"
    />
    <path
      d="M8.5 12.2l2.4 2.4 4.6-4.9"
      stroke="#04121c"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6">
    <path d="M12 8v5" strokeLinecap="round" />
    <circle cx="12" cy="16.8" r="1.2" fill="currentColor" stroke="none" />
    <path d="M10.3 3.9L2.6 17.4A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3.1L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Scanner ticker — the signature element                             */
/* ------------------------------------------------------------------ */

type ScanRow = { url: string; safe: boolean; label: string };

const SCAN_FEED: ScanRow[] = [
  { url: "paypal-secure-login.verify-id.co", safe: false, label: "Spoofed domain" },
  { url: "github.com/settings/tokens", safe: true, label: "Verified" },
  { url: "hdfc-netbanking.account-check.in", safe: false, label: "Lookalike brand" },
  { url: "mail.google.com/inbox", safe: true, label: "Verified" },
  { url: "amaz0n-delivery-refund.top", safe: false, label: "Suspicious TLD" },
  { url: "docs.stripe.com/payments", safe: true, label: "Verified" },
];

function ScannerPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SCAN_FEED.length), 2200);
    return () => clearInterval(t);
  }, []);

  const visible = [0, 1, 2].map((offset) => SCAN_FEED[(index + offset) % SCAN_FEED.length]);

  return (
    <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-teal-400/15 bg-[#08151f]/80 shadow-[0_0_60px_-15px_rgba(45,212,191,0.35)] backdrop-blur-xl">
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-rose-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2 font-mono text-[11px] tracking-wide text-slate-500">
          live scan
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-teal-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
          </span>
          active
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {visible.map((row, i) => (
          <div
            key={`${row.url}-${index}-${i}`}
            className="flex items-center gap-3 px-4 py-3 text-left transition-opacity"
            style={{ opacity: 1 - i * 0.28 }}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md ${
                row.safe
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {row.safe ? <CheckIcon /> : <AlertIcon />}
            </span>

            <span className="truncate font-mono text-[13px] text-slate-300">
              {row.url}
            </span>

            <span
              className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                row.safe
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PhisGuardLanding() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#04121c] font-sans text-white">
      {/* keyframes kept local so no tailwind.config changes are needed */}
      <style>{`
        @keyframes pg-sweep {
          0%   { transform: translateY(-30%); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(130vh); opacity: 0; }
        }
        @keyframes pg-drift {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(24px, -22px); }
        }
        @keyframes pg-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pg-sweep  { animation: pg-sweep 7s linear infinite; }
        .pg-drift  { animation: pg-drift 14s ease-in-out infinite; }
        .pg-in     { animation: pg-fade-up .7s cubic-bezier(.2,.7,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .pg-sweep, .pg-drift, .pg-in { animation: none !important; }
        }
      `}</style>

      {/* ---------------- Background layers ---------------- */}
      <div className="pointer-events-none absolute inset-0">
        {/* deep radial base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(20,184,166,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_75%,rgba(6,182,212,0.12),transparent_70%)]" />

        {/* grid mesh — reads as a network / packet map */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,212,191,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.35) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 65% at 50% 40%, black 30%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 65% at 50% 40%, black 30%, transparent 78%)",
          }}
        />

        {/* scan sweep line — the "detection" motif */}
        <div className="pg-sweep absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-transparent via-teal-400/10 to-transparent" />
        <div className="pg-sweep absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent" />

        {/* soft drifting blooms */}
        <div className="pg-drift absolute left-[12%] top-[22%] h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="pg-drift absolute right-[10%] top-[45%] h-80 w-80 rounded-full bg-teal-500/10 blur-[120px]" />

        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,18,28,0.85)_100%)]" />
      </div>

      {/* ---------------- Navbar ---------------- */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2.5">
          <ShieldIcon className="h-7 w-7 text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]" />
          <span className="text-xl font-bold tracking-tight">PhisGuard</span>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-[15px] font-medium md:flex">
          <a href="#" className="text-white transition-colors hover:text-teal-300">
            Home
          </a>
          <a href="#" className="text-slate-500 transition-colors hover:text-slate-200">
            About
          </a>
         
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="rounded-full border border-teal-300/25 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-teal-300/60 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            Login
          </button>

          <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 px-5 py-2.5 text-sm font-semibold text-[#04121c] shadow-[0_6px_28px_-6px_rgba(45,212,191,0.75)] transition-transform hover:scale-[1.04] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Add Extension</span>
          </button>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <main className="relative z-10 flex flex-col items-center px-6 pb-28 pt-20 text-center sm:pt-24">
        <div className="pg-in mb-7 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-400/[0.07] px-4 py-1.5 text-xs font-medium text-teal-200 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-300" />
          </span>
          Checking links in real time
        </div>

        <h1
          className="pg-in max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[4.2rem]"
          style={{ animationDelay: "80ms" }}
        >
          Detect phishing links{" "}
          <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>

        <p
          className="pg-in mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          PhisGuard reads every link before you click it — checking the domain,
          certificate, and page behaviour against known attack patterns.
        </p>

        <div
          className="pg-in mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 px-9 py-4 text-base font-bold text-[#04121c] shadow-[0_10px_40px_-8px_rgba(45,212,191,0.8)] transition-transform hover:scale-[1.04] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#04121c]">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Get started free</span>
          </button>

          <button className="rounded-full border border-teal-300/30 bg-white/[0.04] px-9 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:border-teal-300/60 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
            Learn more
          </button>
        </div>

        {/* Signature: live scanner panel */}
        <div className="pg-in mt-16 w-full" style={{ animationDelay: "340ms" }}>
          <ScannerPanel />
        </div>

        <p
          className="pg-in mt-8 font-mono text-xs text-slate-600"
          style={{ animationDelay: "420ms" }}
        >
          2.4M links checked this week · 0 accounts lost
        </p>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative z-10 border-t border-teal-300/10 bg-gradient-to-r from-teal-500/10 via-cyan-400/[0.08] to-teal-500/10 py-4 text-center text-sm text-slate-400 backdrop-blur-sm">
        © PhishScan 2026
      </footer>

      {/* ---------------- Login modal ---------------- */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#04121c]/80 px-4 backdrop-blur-md"
          onClick={() => setIsLoginOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pg-in w-full max-w-sm rounded-2xl border border-teal-300/15 bg-[#08151f] p-8 shadow-[0_0_70px_-15px_rgba(45,212,191,0.45)]"
          >
            <div className="mb-6 flex items-center gap-2.5">
              <ShieldIcon className="h-6 w-6 text-teal-300" />
              <span className="text-lg font-bold">Log in to PhisGuard</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="pg-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email
                </label>
                <input
                  id="pg-email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-teal-300/60 focus:ring-1 focus:ring-teal-300/40"
                />
              </div>

              <div>
                <label htmlFor="pg-pass" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <input
                  id="pg-pass"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-teal-300/60 focus:ring-1 focus:ring-teal-300/40"
                />
              </div>

              <button
                onClick={() => setIsLoginOpen(false)}
                className="mt-2 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-[#04121c] shadow-[0_8px_30px_-8px_rgba(45,212,191,0.8)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Log in
              </button>
            </div>

            <button
              onClick={() => setIsLoginOpen(false)}
              className="mt-4 w-full text-center text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
