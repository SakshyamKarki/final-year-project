import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import TrustScoreBar from "../components/ui/TrustScoreBar";
import { RowSkeleton } from "../components/ui/Skeleton";
import { getMyUploads } from "../api/uploads";

function Row({ item }) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <Link
              to={`/uploads/${item.id}`}
              className="text-sm font-extrabold text-slate-900 hover:text-teal-700 hover:underline transition-colors truncate block"
            >
              {item.title}
            </Link>
            <div className="text-xs text-slate-500 mt-0.5">
              {item.category || "Other"} •{" "}
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <Badge value={item.status} />
      </div>
      <div className="mt-2 pl-15">
        <TrustScoreBar score={item.trust_score} />
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getMyUploads();
        if (mounted) setItems(data);
      } catch {
        if (mounted) setErr("Failed to load uploads.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">My uploads</h1>
          <p className="text-sm text-slate-500 mt-1">
            History of your submissions and their analysis results.
          </p>
        </div>
        <Link
          to="/upload"
          className="text-sm font-semibold text-teal-700 hover:underline"
        >
          + New upload
        </Link>
      </div>

      {err && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      <Card className="mt-6 p-4">
        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((i) => <Row key={i.id} item={i} />)
        ) : (
          <div className="py-10 text-center">
            <div className="text-slate-300 text-4xl mb-3">📤</div>
            <div className="text-sm font-semibold text-slate-700">
              No uploads yet
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <Link to="/upload" className="text-teal-700 hover:underline">
                Upload your first item
              </Link>{" "}
              to get started.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
