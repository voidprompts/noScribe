import { Finding } from "@/lib/types";

const severityStyles = {
  critical: {
    badge: "bg-red-100 text-red-700",
    border: "border-l-red-500",
    label: "Critical",
  },
  warning: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-l-amber-400",
    label: "Warning",
  },
  pass: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-l-emerald-500",
    label: "Pass",
  },
} as const;

export default function FindingCard({ finding }: { finding: Finding }) {
  const s = severityStyles[finding.severity];
  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 ${s.border} bg-white p-5 shadow-sm`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}
        >
          {s.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
          {finding.category}
        </span>
        {finding.wcag && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
            {finding.wcag}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-slate-900">{finding.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{finding.detail}</p>
      {finding.fix && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <span className="font-semibold text-indigo-600">Suggested fix: </span>
          {finding.fix}
        </div>
      )}
    </div>
  );
}
