const STYLES = {
  REAL: "bg-teal-50 text-teal-700 border-teal-200",
  AI_GEN: "bg-rose-50 text-rose-700 border-rose-200",
  UNCERTAIN: "bg-amber-50 text-amber-700 border-amber-200",
  // Legacy labels kept for any existing DB rows
  FAKE: "bg-rose-50 text-rose-700 border-rose-200",
  SUSPICIOUS: "bg-amber-50 text-amber-700 border-amber-200",
  // Moderation statuses
  APPROVED: "bg-teal-50 text-teal-700 border-teal-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  QUEUED: "bg-amber-50 text-amber-700 border-amber-200",
  NONE: "bg-slate-50 text-slate-700 border-slate-200",
};

const LABELS = {
  AI_GEN: "AI-Generated",
  UNCERTAIN: "Uncertain",
  REAL: "Real",
  FAKE: "AI-Generated",
  SUSPICIOUS: "Uncertain",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  QUEUED: "Pending Review",
  NONE: "—",
};

export default function Badge({ value }) {
  const cls = STYLES[value] ?? "bg-slate-50 text-slate-700 border-slate-200";
  const label = LABELS[value] ?? value;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
