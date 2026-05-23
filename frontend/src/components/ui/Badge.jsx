const styles = {
  REAL: "bg-teal-50 text-teal-700 border-teal-200",
  FAKE: "bg-rose-50 text-rose-700 border-rose-200",
  SUSPICIOUS: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-teal-50 text-teal-700 border-teal-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  QUEUED: "bg-amber-50 text-amber-700 border-amber-200",
  NONE: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function Badge({ value }) {
  const cls = styles[value] || "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
}