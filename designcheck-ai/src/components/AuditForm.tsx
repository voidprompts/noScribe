"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import { saveAudit } from "@/lib/storage";

const STEPS = [
  "Capturing page…",
  "Extracting color palette & typography…",
  "Checking WCAG 2.2 contrast & structure…",
  "Scoring brand consistency…",
  "Compiling your report…",
];

export default function AuditForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "screenshot">("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const startAudit = () => {
    setError(null);
    let source = "";
    if (mode === "url") {
      const trimmed = url.trim();
      if (!trimmed) {
        setError("Enter a website URL to audit.");
        return;
      }
      const normalized = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      try {
        const u = new URL(normalized);
        if (!u.hostname.includes(".")) throw new Error();
        source = normalized;
      } catch {
        setError("That doesn't look like a valid URL. Try e.g. acme.com");
        return;
      }
    } else {
      if (!file) {
        setError("Drop or choose a screenshot first.");
        return;
      }
      source = file.name;
    }

    setRunning(true);
    setStep(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i < STEPS.length) {
        setStep(i);
      } else {
        clearInterval(interval);
        const audit = runAudit(
          source,
          mode,
          mode === "screenshot" ? preview ?? undefined : undefined
        );
        saveAudit(audit);
        router.push(`/audit/${audit.id}`);
      }
    }, 650);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/60 sm:p-8">
      {!running ? (
        <>
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            {(["url", "screenshot"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {m === "url" ? "🔗 Website URL" : "🖼 Screenshot"}
              </button>
            ))}
          </div>

          {mode === "url" ? (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startAudit()}
              placeholder="yourstartup.com"
              aria-label="Website URL to audit"
              className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              onClick={() => fileInput.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
              }`}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Screenshot preview"
                    className="mb-3 max-h-40 rounded-lg border border-slate-200 shadow-sm"
                  />
                  <p className="text-sm font-medium text-slate-700">{file?.name}</p>
                  <p className="mt-1 text-xs text-slate-400">Click to replace</p>
                </>
              ) : (
                <>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                    📤
                  </div>
                  <p className="font-medium text-slate-700">
                    Drop your screenshot here
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    or click to browse — PNG, JPG, WebP
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            onClick={startAudit}
            className="mt-5 w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 active:scale-[0.99]"
          >
            Get my free audit in 30 seconds →
          </button>
          <p className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>✓ No signup</span>
            <span>✓ No credit card</span>
            <span>✓ Instant results</span>
          </p>
        </>
      ) : (
        <div className="py-6">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg shadow-indigo-200 animate-pulse-bar">
              🔍
            </div>
          </div>
          <ul className="space-y-3">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-3 text-sm transition ${
                  i < step
                    ? "text-emerald-600"
                    : i === step
                      ? "font-semibold text-slate-900"
                      : "text-slate-300"
                }`}
              >
                <span className="w-5 text-center">
                  {i < step ? "✓" : i === step ? "●" : "○"}
                </span>
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
