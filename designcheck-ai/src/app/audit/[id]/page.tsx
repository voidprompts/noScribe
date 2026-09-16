"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Audit } from "@/lib/types";
import { getAudit } from "@/lib/storage";
import ScoreRing from "@/components/ScoreRing";
import FindingCard from "@/components/FindingCard";

type Tab = "all" | "brand" | "accessibility";

export default function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [audit, setAudit] = useState<Audit | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    setAudit(getAudit(id) ?? null);
  }, [id]);

  if (audit === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading report…
      </div>
    );
  }

  if (audit === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mb-4 text-5xl">🕳️</div>
        <h1 className="text-2xl font-bold text-slate-900">Report not found</h1>
        <p className="mt-2 text-slate-600">
          This audit may have been cleared from your browser. Run a new one — it
          takes 30 seconds.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
        >
          Run a new audit
        </Link>
      </div>
    );
  }

  const issues = audit.findings.filter((f) => f.severity !== "pass");
  const passes = audit.findings.filter((f) => f.severity === "pass");
  const filtered = (list: typeof audit.findings) =>
    tab === "all" ? list : list.filter((f) => f.category === tab);

  const critCount = issues.filter((f) => f.severity === "critical").length;
  const warnCount = issues.filter((f) => f.severity === "warning").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="animate-fade-up mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            ← Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Design audit report
          </h1>
          <p className="mt-1 text-slate-500">
            {audit.sourceType === "url" ? "🔗" : "🖼"}{" "}
            <span className="font-medium text-slate-700">{audit.source}</span>
            {" · "}
            {new Date(audit.createdAt).toLocaleString()}
          </p>
        </div>
        <Link
          href="/pricing"
          className="self-start rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 sm:self-auto"
        >
          Export PDF & share — Pro ✦
        </Link>
      </div>

      {/* Scores */}
      <div className="animate-fade-up mb-8 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-[auto_1fr] sm:p-8">
        <div className="flex items-center justify-center gap-8 sm:gap-10">
          <ScoreRing score={audit.overallScore} label="Overall" size={140} />
          <div className="flex flex-col gap-6">
            <ScoreRing score={audit.brandScore} label="Brand" size={88} />
            <ScoreRing score={audit.accessibilityScore} label="Accessibility" size={88} />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 sm:border-l sm:border-slate-100 sm:pl-8">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-red-50 px-3.5 py-1.5 text-sm font-semibold text-red-700">
              {critCount} critical
            </span>
            <span className="rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-700">
              {warnCount} warnings
            </span>
            <span className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700">
              {passes.length} passing
            </span>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Detected palette
            </p>
            <div className="flex gap-2">
              {audit.palette.map((c) => (
                <div key={c} className="group relative">
                  <div
                    className="h-9 w-9 rounded-lg border border-slate-200 shadow-sm"
                    style={{ background: c }}
                  />
                  <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Detected typography
            </p>
            <div className="flex flex-wrap gap-2">
              {audit.fonts.map((f) => (
                <span
                  key={f}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                >
                  {f}
                </span>
              ))}
              {audit.fonts.length > 2 && (
                <span className="rounded-lg bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  {audit.fonts.length} families — consider consolidating
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {audit.screenshotDataUrl && (
        <div className="animate-fade-up mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Audited screenshot
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={audit.screenshotDataUrl}
            alt={`Screenshot audited: ${audit.source}`}
            className="max-h-96 rounded-xl border border-slate-200"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {(
          [
            ["all", "All findings"],
            ["brand", "🎨 Brand"],
            ["accessibility", "♿ Accessibility"],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Findings */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered(issues).map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
      </div>

      {filtered(passes).length > 0 && (
        <>
          <h2 className="mt-10 mb-4 text-lg font-semibold text-slate-900">
            ✅ What&apos;s working well
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered(passes).map((f) => (
              <FindingCard key={f.id} finding={f} />
            ))}
          </div>
        </>
      )}

      {/* Upsell */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white shadow-xl">
        <h2 className="text-2xl font-bold">Want the full teardown?</h2>
        <p className="mx-auto mt-2 max-w-xl text-indigo-100">
          Pro unlocks unlimited audits, PDF exports, competitor comparisons, and
          weekly re-scans that alert you when your score drops.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
        >
          See plans →
        </Link>
      </div>
    </div>
  );
}
