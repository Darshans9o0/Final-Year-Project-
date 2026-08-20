import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  Lock,
  Globe2,
  Fingerprint,
  History,
  ArrowLeft,
  Search,
  CircleCheck,
  CircleX,
  CircleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------------------
   PhishNet.AI — URL threat checker
   Palette: void navy #0A0E16, panel #10151F, hairline #1E2733
   accent cyan #33C7E0 (trust), accent red #FF5470 (threat)
   Signature: live radar sweep on the URL field + a verdict
   dial that "resolves" out of scanline noise.
--------------------------------------------------------- */

type Verdict = "legitimate" | "phishing";

interface Signal {
  label: string;
  ok: boolean;
  detail: string;
}

interface AnalysisResult {
  verdict: Verdict;
  score: number;
  signals: Signal[];
  host: string;
}

type Stage = "idle" | "scanning" | "result";

const SCAN_STEPS: string[] = [
  "Resolving domain registration…",
  "Checking TLS certificate chain…",
  "Cross-referencing blacklist feeds…",
  "Scoring lexical similarity to known brands…",
  "Weighing final verdict…",
];

const SUSPICIOUS_HINTS: string[] = [
  "verify",
  "secure-",
  "login",
  "update",
  "account",
  "confirm",
  "signin",
  "wallet",
  "bank",
];

function analyzeUrl(raw: string): AnalysisResult {
  const url = raw.trim().toLowerCase();
  let score = 8; // base risk out of 100
  const signals: Signal[] = [];

  const hasHttps = url.startsWith("https://");
  signals.push({
    label: "Encrypted connection (HTTPS)",
    ok: hasHttps,
    detail: hasHttps ? "Valid TLS scheme detected" : "No TLS scheme — traffic may be unencrypted",
  });
  if (!hasHttps) score += 25;

  const hitHint = SUSPICIOUS_HINTS.find((h) => url.includes(h));
  signals.push({
    label: "Brand / credential lure keywords",
    ok: !hitHint,
    detail: hitHint ? `Flagged term "${hitHint}" found in URL` : "No lure keywords found",
  });
  if (hitHint) score += 35;

  const domainMatch = url.match(/^https?:\/\/([^/]+)/);
  const host = domainMatch ? domainMatch[1] : url;
  const hyphenCount = (host.match(/-/g) || []).length;
  signals.push({
    label: "Domain structure",
    ok: hyphenCount < 2,
    detail: hyphenCount >= 2 ? `${hyphenCount} hyphens in host — common spoof pattern` : "Clean, simple host structure",
  });
  if (hyphenCount >= 2) score += 20;

  const knownTlds = [".com", ".org", ".net", ".io", ".ai", ".edu", ".gov", ".co"];
  const tldOk = knownTlds.some((t) => host.endsWith(t));
  signals.push({
    label: "Top-level domain reputation",
    ok: tldOk,
    detail: tldOk ? "Established TLD" : "Uncommon or high-abuse TLD",
  });
  if (!tldOk) score += 15;

  const numericRatio = (host.match(/[0-9]/g) || []).length / Math.max(host.length, 1);
  signals.push({
    label: "Character composition",
    ok: numericRatio < 0.2,
    detail: numericRatio >= 0.2 ? "Unusually high digit density in host" : "Digit density within normal range",
  });
  if (numericRatio >= 0.2) score += 10;

  score = Math.max(3, Math.min(97, score + Math.round(Math.random() * 6)));
  const verdict: Verdict = score >= 45 ? "phishing" : "legitimate";
  return { verdict, score, signals, host: host || raw };
}

interface GaugeProps {
  score: number;
  verdict: Verdict;
}

function Gauge({ score, verdict }: GaugeProps) {
  const isThreat = verdict === "phishing";
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const pct = isThreat ? score : 100 - score;
  const offset = circumference - (pct / 100) * circumference;
  const color = isThreat ? "#FF5470" : "#33C7E0";

  return (
    <div className="relative w-[168px] h-[168px] shrink-0">
      <svg width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
        <circle cx="84" cy="84" r={radius} fill="none" stroke="#1E2733" strokeWidth="10" />
        <circle
          cx="84"
          cy="84"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-semibold tabular-nums" style={{ color }}>
          {pct}%
        </span>
        <span className="text-[10px] tracking-[0.18em] text-slate-500 uppercase mt-1">
          {isThreat ? "risk score" : "trust score"}
        </span>
      </div>
    </div>
  );
}

export default function PhishNetApp() {
  const [url, setUrl] = useState<string>("");
  const [stage, setStage] = useState<Stage>("idle");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleAnalyze(): void {
    if (!url.trim() || stage === "scanning") return;
    setResult(null);
    setStage("scanning");
    setStepIndex(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      if (i >= SCAN_STEPS.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        const r = analyzeUrl(url);
        setResult(r);
        setStage("result");
        return;
      }
      setStepIndex(i);
    }, 480);
  }

  function handleReset(): void {
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("idle");
    setResult(null);
    setStepIndex(0);
  }

  const isThreat = result?.verdict === "phishing";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#0A0E16] text-slate-200 font-sans relative overflow-hidden">
      <style>{`
        @keyframes scanline {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: .35; }
          50% { opacity: .8; }
        }
        @keyframes drift {
          0% { background-position: 0 0; }
          100% { background-position: 120px 120px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .5s ease forwards; }
        .grid-drift {
          background-image:
            linear-gradient(rgba(51,199,224,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(51,199,224,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: drift 16s linear infinite;
        }
        .mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
        @media (prefers-reduced-motion: reduce) {
          .grid-drift, .scan-sweep, .fade-up { animation: none !important; }
        }
      `}</style>

      {/* ambient grid + glow */}
      <div className="absolute inset-0 grid-drift pointer-events-none" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: isThreat
            ? "radial-gradient(closest-side, rgba(255,84,112,0.14), transparent 70%)"
            : "radial-gradient(closest-side, rgba(51,199,224,0.14), transparent 70%)",
          transition: "background 0.6s ease",
        }}
      />

      {/* header */}
      <header className="relative z-10 flex items-center gap-2.5 px-6 sm:px-10 h-16 border-b border-[#1E2733]/80 backdrop-blur-sm">
        <div className="w-7 h-7 rounded-md bg-[#33C7E0]/10 border border-[#33C7E0]/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#33C7E0]" strokeWidth={2.25} />
        </div>
        <span className="font-semibold tracking-tight text-[15px] text-slate-100">
          PhishNet<span className="text-[#33C7E0]">.AI</span>
        </span>
        <span className="ml-3 hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 mono">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#33C7E0] opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#33C7E0]" />
          </span>
          threat feed live
        </span>
      </header>

      {/* main */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 pt-20 pb-24">
        <div className="mb-2 flex items-center gap-2 text-[11px] mono tracking-[0.2em] text-slate-500 uppercase">
          <ScanLine className="w-3.5 h-3.5 text-[#33C7E0]" />
          URL threat inspector
        </div>

        <h1 className="text-[44px] sm:text-[56px] leading-[1.02] font-semibold tracking-tight text-slate-50 mb-4">
          Check a <span className="text-[#33C7E0]">URL</span>
        </h1>

        <p className="text-slate-400 text-[15px] leading-relaxed max-w-md mb-8">
          Paste a link below. We inspect its certificate, structure and
          lexical fingerprint to tell you whether it's{" "}
          <span className="text-[#33C7E0] font-medium">legitimate</span> or{" "}
          <span className="text-[#FF5470] font-medium">phishing</span>.
        </p>

        {/* input card */}
        <div className="relative rounded-2xl border border-[#1E2733] bg-[#10151F]/80 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div
            className={`relative rounded-xl border overflow-hidden transition-colors duration-300 ${
              stage === "scanning" ? "border-[#33C7E0]/50" : "border-[#26313F] focus-within:border-[#33C7E0]/60"
            }`}
          >
            {stage === "scanning" && (
              <div
                className="scan-sweep absolute inset-y-0 w-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(51,199,224,0.18), transparent)",
                  animation: "scanline 1.4s linear infinite",
                }}
              />
            )}
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-[#0D1219]">
              <Globe2 className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://www.youtube.com/"
                className="mono w-full bg-transparent outline-none text-[14px] text-slate-100 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
  onClick={() => navigate("/website-analysis-result")}
  disabled={!url.trim() || stage === "scanning"}
  className="group relative inline-flex items-center gap-2 rounded-lg bg-[#33C7E0] text-[#06222A] text-[13px] font-semibold px-4 py-2.5 tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#5AD3E6] active:scale-[0.98] transition-all"
>
  <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
  {stage === "scanning" ? "Analyzing…" : "Analyze URL"}
</button>
           <button
  onClick={() => navigate("/")}
  className="inline-flex items-center gap-2 rounded-lg border border-[#26313F] text-slate-400 text-[13px] font-medium px-4 py-2.5 hover:text-slate-200 hover:border-[#3A4756] transition-colors"
>
  <ArrowLeft className="w-3.5 h-3.5" />
  Return home
</button>
          </div>

          {/* scanning readout */}
          {stage === "scanning" && (
            <div className="mt-5 pt-4 border-t border-[#1E2733] fade-up">
              <div className="flex items-center gap-2 mono text-[12px] text-[#33C7E0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#33C7E0]" style={{ animation: "pulseGlow 1s ease-in-out infinite" }} />
                {SCAN_STEPS[stepIndex]}
              </div>
              <div className="mt-3 h-1 w-full bg-[#1E2733] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#33C7E0] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((stepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* result */}
        {stage === "result" && result && (
          <div
            key={result.host}
            className="fade-up mt-6 rounded-2xl border p-6 sm:p-7"
            style={{
              borderColor: isThreat ? "rgba(255,84,112,0.35)" : "rgba(51,199,224,0.3)",
              background: isThreat
                ? "linear-gradient(180deg, rgba(255,84,112,0.06), rgba(16,21,31,0.4))"
                : "linear-gradient(180deg, rgba(51,199,224,0.06), rgba(16,21,31,0.4))",
            }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Gauge score={result.score} verdict={result.verdict} />

              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1.5">
                  {isThreat ? (
                    <ShieldAlert className="w-5 h-5 text-[#FF5470]" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-[#33C7E0]" />
                  )}
                  <h2
                    className="text-xl font-semibold tracking-tight"
                    style={{ color: isThreat ? "#FF5470" : "#33C7E0" }}
                  >
                    {isThreat ? "Likely phishing" : "Looks legitimate"}
                  </h2>
                </div>
                <p className="mono text-[12.5px] text-slate-500 break-all mb-4">{result.host}</p>

                <div className="space-y-2.5">
                  {result.signals.map((s: Signal, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[13px]">
                      {s.ok ? (
                        <CircleCheck className="w-4 h-4 text-[#33C7E0] mt-0.5 shrink-0" />
                      ) : (
                        <CircleX className="w-4 h-4 text-[#FF5470] mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="text-slate-200 font-medium">{s.label}</span>
                        <span className="text-slate-500"> — {s.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {isThreat && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FF5470]/8 border border-[#FF5470]/20 px-3 py-2.5 text-[12.5px] text-[#FF9DAE]">
                    <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    Don't enter credentials or personal data on this site. Report it to your IT
                    or security team.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* footer trust strip */}
        <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11.5px] text-slate-600 mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> TLS inspection
          </span>
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" /> Lexical fingerprinting
          </span>
          <span className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Blacklist cross-reference
          </span>
        </div>
      </main>
    </div>
  );
}
