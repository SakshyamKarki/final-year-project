import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { getFeed } from "../api/feed";

function FeedCard({ item }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="w-28 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : null}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
              <div className="text-xs text-slate-500 mt-1">
                {item.uploader_name ? `By ${item.uploader_name}` : ""} •{" "}
                {new Date(item.created_at).toLocaleString()}
              </div>
            </div>
            <Badge value={item.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              {item.category || "Other"}
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              Score: {(item.trust_score ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("newest"); // newest | score

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getFeed();
        if (mounted) setItems(data);
      } catch {
        setErr("Failed to load feed.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const categories = ["ALL", "Politics", "Business", "Technology", "Health", "Sports", "Entertainment", "Other"];

  const filtered = useMemo(() => {
    let out = items;
    if (category !== "ALL") out = out.filter((i) => (i.category || "Other") === category);

    out = [...out];
    if (sort === "score") {
      out.sort((a, b) => (b.trust_score ?? 0) - (a.trust_score ?? 0));
    } else {
      out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return out;
  }, [items, category, sort]);

  return (
    <div>
      <div className="text-xl font-extrabold text-slate-900">Feed</div>
      <div className="text-sm text-slate-500 mt-1">Approved uploads appear here.</div>

      <Card className="mt-4 p-4 flex flex-wrap gap-3 items-center">
        <div>
          <div className="text-xs font-semibold text-slate-700">Category</div>
          <select
            className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-700">Sort</div>
          <select
            className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="score">Score</option>
          </select>
        </div>
      </Card>

      {err ? <div className="mt-4 text-sm text-rose-600">{err}</div> : null}
      {loading ? <div className="mt-6 text-sm text-slate-500">Loading...</div> : null}

      <div className="mt-6 grid grid-cols-1 gap-4">
        {filtered.map((i) => <FeedCard key={i.id} item={i} />)}
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="mt-8 text-sm text-slate-500">No feed items.</div>
      ) : null}
    </div>
  );
}