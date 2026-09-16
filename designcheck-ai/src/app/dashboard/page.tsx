"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Audit } from "@/lib/types";
import { deleteAudit, getAudits, getPlan, Plan } from "@/lib/storage";
import { scoreColor } from "@/components/ScoreRing";

const PLAN_LABELS: Record<Plan, { name: string; limit: string; badge: string }> = {
  free: { name: "Free", limit: "3 audits / month", badge: "bg-slate-100 text-slate-700" },
  pro: { name: "Pro", limit: "Unlimited audits", badge: "bg-indigo-100 text-indigo-700" },
  agency: { name: "Agency", limit: "Unlimited + team seats", badge: "bg-violet-100 text-violet-700" },
};

function ScorePill({ score }: { score: number }) {
  return (
    <span
      className="inline-flex h-9 w-12 items-center justify-center rounded-lg text-sm font-bold text-white"
      style={{ background: scoreColor(score) }}
    >
      {score}
    </span>
  );
}

export default function Dashboard() {
  const [audits, setAudits] = useState<Audit[] | null>(null);
  const [plan, setPlanState] = useState<Plan>("free");

  useEffect(() => {
    setAudits(getAudits());
    setPlanState(getPlan());
  }, []);

  const remove = (id: string) => {
    deleteAudit(id);
    setAudits(getAudits());
  };

  const avg =
    audits && audits.length
      ? Math.round(audits.reduce((s, a) => s + a.overallScore, 0) / audits.length)
      : null;
  const best =
    audits && audits.length ? Math.max(...audits.map((a) => a.overallScore)) : null;
  const criticals =
    audits?.reduce(
      (s, a) => s + a.findings.filter((f) => f.severity === "critical").length,
      0
    ) ?? 0;

  const planInfo = PLAN_LABELS[plan];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="animate-fade-up mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Your dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Every audit you run is saved here, in your browser.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${planInfo.badge}`}
          >
            {planInfo.name} plan · {planInfo.limit}
          </span>
          {plan === "free" && (
            <Link
              href="/pricing"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-up mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Audits run", value: audits ? String(audits.length) : "—" },
          { label: "Average score", value: avg !== null ? String(avg) : "—" },
          { label: "Best score", value: best !== null ? String(best) : "—" },
          { label: "Open critical issues", value: audits ? String(criticals) : "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Audit list */}
      {audits === null ? (
        <div className="py-16 text-center text-slate-400">Loading…</div>
      ) : audits.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <h2 className="text-xl font-semibold text-slate-900">No audits yet</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-500">
            Run your first design audit and it will show up here with its score
            history and findings.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500"
          >
            Run your first audit →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Source</th>
                <th className="hidden px-5 py-3.5 sm:table-cell">Date</th>
                <th className="px-5 py-3.5">Overall</th>
                <th className="hidden px-5 py-3.5 md:table-cell">Brand</th>
                <th className="hidden px-5 py-3.5 md:table-cell">A11y</th>
                <th className="hidden px-5 py-3.5 lg:table-cell">Issues</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audits.map((a) => {
                const issueCount = a.findings.filter(
                  (f) => f.severity !== "pass"
                ).length;
                return (
                  <tr key={a.id} className="group transition hover:bg-indigo-50/40">
                    <td className="max-w-[220px] px-5 py-4">
                      <Link href={`/audit/${a.id}`} className="block">
                        <span className="block truncate font-semibold text-slate-900 group-hover:text-indigo-700">
                          {a.sourceType === "url" ? "🔗 " : "🖼 "}
                          {a.source}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-4 text-slate-500 sm:table-cell">
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <ScorePill score={a.overallScore} />
                    </td>
                    <td className="hidden px-5 py-4 font-semibold text-slate-700 md:table-cell">
                      {a.brandScore}
                    </td>
                    <td className="hidden px-5 py-4 font-semibold text-slate-700 md:table-cell">
                      {a.accessibilityScore}
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {issueCount} findings
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/audit/${a.id}`}
                          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => remove(a.id)}
                          aria-label={`Delete audit of ${a.source}`}
                          className="rounded-lg px-2 py-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
