function pulse(className) {
  return `animate-pulse rounded-xl bg-slate-200 ${className}`;
}

/** Skeleton for a feed/upload card */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
      <div className="flex gap-4">
        <div className={pulse("w-28 h-20 shrink-0")} />
        <div className="flex-1 space-y-2">
          <div className={pulse("h-4 w-3/4")} />
          <div className={pulse("h-3 w-1/2")} />
          <div className="flex gap-2 mt-3">
            <div className={pulse("h-6 w-20 rounded-full")} />
            <div className={pulse("h-6 w-16 rounded-full")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton for a table row in admin/moderation */
export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100">
      <div className={pulse("h-4 w-28")} />
      <div className={pulse("h-4 w-40")} />
      <div className={pulse("h-4 w-10")} />
      <div className={pulse("h-4 w-10")} />
      <div className={pulse("h-8 w-24 rounded-xl")} />
    </div>
  );
}

/** Generic single-line skeleton */
export function LineSkeleton({ className = "h-4 w-full" }) {
  return <div className={pulse(className)} />;
}
