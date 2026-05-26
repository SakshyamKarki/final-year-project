/**
 * TrustScoreBar
 * Renders a labeled progress bar that conveys the model's confidence
 * that the image is a real photograph (0 = certain AI-generated, 1 = certain real).
 */
export default function TrustScoreBar({ score }) {
  const pct = Math.round((score ?? 0) * 100);

  let barColor, label;
  if (pct >= 80) {
    barColor = "bg-teal-500";
    label = "Real photograph";
  } else if (pct >= 55) {
    barColor = "bg-amber-400";
    label = "Uncertain";
  } else {
    barColor = "bg-rose-500";
    label = "AI-generated";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">Confidence</span>
        <span className="text-xs font-semibold text-slate-700">
          {pct}% — {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
