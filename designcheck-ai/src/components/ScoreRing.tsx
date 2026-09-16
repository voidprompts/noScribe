export function scoreColor(score: number) {
  if (score >= 85) return "#10b981";
  if (score >= 65) return "#f59e0b";
  return "#ef4444";
}

export default function ScoreRing({
  score,
  label,
  size = 120,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const stroke = size / 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: size / 3.4, color }}
          >
            {score}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}
