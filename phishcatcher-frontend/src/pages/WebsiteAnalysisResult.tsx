import React, { useMemo, useState } from "react";
import { ArrowLeft, Check, X, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------------------------------------------------
   WebsiteAnalysisResult — terminal/readout aesthetic
   Palette: near-black #0A0A0C, hairline #2E3238,
   safe neon #39FF8C, threat neon #FF3B5C, amber glitch tick #FF3B5C/30
   Font: monospace throughout — the whole page reads like a
   printout from a scan tool, boxes drawn with real borders
   instead of literal ASCII characters.
   Signature: the notched terminal-window corner + the
   flickering tick-rail running down the right edge.
--------------------------------------------------------- */

export type Verdict = "safe" | "phishing";

export interface AnalysisCategory {
  label: string;
  safe: boolean;
}

export interface DetectionDetail {
  label: string;
  value: string;
  flagged?: boolean;
}

export interface WebsiteAnalysisResultProps {
  url?: string;
  verdict?: Verdict;
  confidence?: number;
  categories?: AnalysisCategory[];
  details?: DetectionDetail[];
  onBack?: () => void;
  onScanAnother?: () => void;
}

const DEFAULT_SAFE: Required<Omit<WebsiteAnalysisResultProps, "onBack" | "onScanAnother">> = {
  url: "https://example.com",
  verdict: "safe",
  confidence: 98.5,
  categories: [
    { label: "URL Analysis", safe: true },
    { label: "Domain", safe: true },
    { label: "Content", safe: true },
  ],
  details: [
    { label: "URL Length", value: "Normal" },
    { label: "Special Characters", value: "None" },
    { label: "IP Address", value: "No" },
    { label: "SSL Certificate", value: "Valid" },
  ],
};

const DEFAULT_PHISHING: Required<Omit<WebsiteAnalysisResultProps, "onBack" | "onScanAnother">> = {
  url: "http://secure-paypal-verify.tk/login",
  verdict: "phishing",
  confidence: 94.2,
  categories: [
    { label: "URL Analysis", safe: false },
    { label: "Domain", safe: false },
    { label: "Content", safe: true },
  ],
  details: [
    { label: "URL Length", value: "Excessive", flagged: true },
    { label: "Special Characters", value: "3 hyphens", flagged: true },
    { label: "IP Address", value: "No" },
    { label: "SSL Certificate", value: "Missing", flagged: true },
  ],
};

/** Tick-rail down the right edge — mostly idle, a few flagged red. */
const TICK_PATTERN: boolean[] = [
  false, false, false, true, false, false, false, false, false, false,
  false, false, true, false, false, false, false, false, false, false,
  true, false, false, false, false, false, false, false, false, false,
  false, false, true, false,
];

export default function WebsiteAnalysisResult(props: WebsiteAnalysisResultProps) {
  const [demoVerdict, setDemoVerdict] = useState<Verdict>(props.verdict ?? "safe");

  const data = useMemo(() => {
    const base = demoVerdict === "phishing" ? DEFAULT_PHISHING : DEFAULT_SAFE;
    return {
      url: props.url ?? base.url,
      verdict: demoVerdict,
      confidence: props.confidence ?? base.confidence,
      categories: props.categories ?? base.categories,
      details: props.details ?? base.details,
    };
  }, [demoVerdict, props]);

  const isSafe = data.verdict === "safe";
  const accent = isSafe ? "#39FF8C" : "#FF3B5C";
  const accentDim = isSafe ? "rgba(57,255,140,0.12)" : "rgba(255,59,92,0.12)";
  const riskLevel = isSafe ? "LOW" : "HIGH";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#050506] flex items-center justify-center p-4 sm:p-8 font-mono">
      <style>{`
        @keyframes flicker {
          0%, 96%, 100% { opacity: 1; }
          97% { opacity: 0.25; }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          50% { box-shadow: 0 0 0 6px transparent; opacity: 0.7; }
        }
        .tick-flagged { animation: flicker 3.2s ease-in-out infinite; }
        .verdict-dot { animation: dotPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .tick-flagged, .verdict-dot { animation: none !important; }
        }
      `}</style>

      <div
        className="relative w-full max-w-2xl bg-[#0A0A0C] border border-[#2E3238]"
        style={{ clipPath: "polygon(36px 0, 100% 0, 100% 100%, 0 100%, 0 36px)" }}
      >
        {/* right tick-rail */}
        <div className="hidden sm:flex absolute -right-5 top-10 bottom-10 w-4 flex-col justify-between">
          {TICK_PATTERN.map((flagged, i) => (
            <span
              key={i}
              className={`h-3 w-px mx-auto ${flagged ? "tick-flagged" : ""}`}
              style={{ backgroundColor: flagged ? "#FF3B5C" : "#3A3F45" }}
            />
          ))}
        </div>

        <div className="px-7 sm:px-10 py-8 sm:py-10">
          {/* back link */}
          <button
            onClick={props.onBack}
            className="group inline-flex items-center gap-2 text-[13px] text-slate-400 hover:text-slate-100 transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back TO Home
          </button>

          {/* heading */}
          <div className="text-center mb-8">
            <p className="text-[12px] tracking-[0.35em] text-slate-500 uppercase mb-6">
              Website Analysis
            </p>

            <div className="flex items-center justify-center gap-3 mb-5">
              <Circle
                className="verdict-dot w-3 h-3 shrink-0"
                style={{ color: accent, fill: accent }}
              />
              <span
                className="text-[17px] sm:text-[19px] font-semibold tracking-wide"
                style={{ color: accent }}
              >
                {isSafe ? "LEGITIMATE WEBSITE" : "PHISHING DETECTED"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8 text-[13px] text-slate-300">
              <span>
                Confidence:{" "}
                <span className="font-semibold" style={{ color: accent }}>
                  {data.confidence.toFixed(1)}%
                </span>
              </span>
              <span>
                Risk Level:{" "}
                <span className="font-semibold" style={{ color: accent }}>
                  {riskLevel}
                </span>
              </span>
            </div>
          </div>

          {/* url box */}
          <div className="border border-[#2E3238] px-5 py-4 mb-6">
            <p className="text-[10px] tracking-[0.25em] text-slate-500 uppercase mb-1.5">URL</p>
            <p className="text-[14px] text-slate-100 break-all">{data.url}</p>
          </div>

          {/* category boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-9">
            {data.categories.map((cat) => (
              <div
                key={cat.label}
                className="border px-4 py-3.5 flex items-center justify-between"
                style={{
                  borderColor: cat.safe ? "rgba(57,255,140,0.35)" : "rgba(255,59,92,0.4)",
                  backgroundColor: cat.safe ? accentDim.replace("0.12", "0.05") : "rgba(255,59,92,0.05)",
                }}
              >
                <span className="text-[13px] text-slate-300">{cat.label}</span>
                <span
                  className="inline-flex items-center gap-1 text-[12px] font-semibold"
                  style={{ color: cat.safe ? "#39FF8C" : "#FF3B5C" }}
                >
                  {cat.safe ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {cat.safe ? "Safe" : "Unsafe"}
                </span>
              </div>
            ))}
          </div>

          {/* detection details */}
          <p className="text-[13px] font-semibold text-slate-200 tracking-wide mb-4">
            Detection Details
          </p>
          <div className="space-y-3 mb-10">
            {data.details.map((d) => (
              <div key={d.label} className="flex items-center justify-between text-[13px]">
                <span className="text-slate-400">{d.label}</span>
                <span
                  className="font-medium"
                  style={{ color: d.flagged ? "#FF3B5C" : "#CBD5E1" }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          {/* action */}
          <div className="flex justify-center">
           <button
  onClick={() => navigate("/scanner")}
  className="border border-[#3A3F45] px-6 py-2.5 text-[13px] tracking-wide text-slate-200 hover:border-slate-400 hover:text-white transition-colors"
>
  Scan Another URL
</button>
          </div>

          {/* demo toggle — remove in production, kept for previewing both states */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setDemoVerdict(isSafe ? "phishing" : "safe")}
              className="text-[11px] text-slate-600 hover:text-slate-400 tracking-wide transition-colors"
            >
              demo: view {isSafe ? "phishing" : "legitimate"} example →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
