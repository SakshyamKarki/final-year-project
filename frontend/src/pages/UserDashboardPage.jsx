import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { getMyUploads } from "../api/uploads";

function Row({ item }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div>
          <Link
            to={`/uploads/${item.id}`}
            className="text-sm font-extrabold text-slate-900 hover:underline"
          >
            {item.title}
          </Link>
          <div className="text-xs text-slate-500">
            {(item.category || "Other")} • {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
          Score: {(item.trust_score ?? 0).toFixed(2)}
        </span>
        <Badge value={item.status} />
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
        setErr("Failed to load uploads.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <div className="text-xl font-extrabold text-slate-900">My uploads</div>
      <div className="text-sm text-slate-500 mt-1">History of your submissions.</div>

      {err ? <div className="mt-4 text-sm text-rose-600">{err}</div> : null}
      {loading ? <div className="mt-6 text-sm text-slate-500">Loading...</div> : null}

      <Card className="mt-6 p-4">
        {items.map((i) => <Row key={i.id} item={i} />)}
        {!loading && items.length === 0 ? (
          <div className="text-sm text-slate-500">No uploads yet.</div>
        ) : null}
      </Card>
    </div>
  );
}