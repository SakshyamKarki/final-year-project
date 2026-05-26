import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import TrustScoreBar from "../components/ui/TrustScoreBar";
import { CardSkeleton } from "../components/ui/Skeleton";
import { getFeed } from "../api/feed";

function FeedCard({ item }) {
  return (
    <Link to={`/uploads/${item.id}`} className="block group">
      <Card className="p-4 transition hover:shadow-md hover:border-slate-300">
        <div className="flex gap-4">
          <div className="w-28 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No image
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {item.uploader_name ? `By ${item.uploader_name}` : ""}
                  {item.uploader_name ? " • " : ""}
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
              <Badge value={item.status} />
            </div>

            <div className="mt-3">
              <TrustScoreBar score={item.trust_score} />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
                {item.category || "Other"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

const CATEGORIES = [
  "ALL",
  "Politics",
  "Business",
  "Technology",
  "Health",
  "Sports",
  "Entertainment",
  "Other",
];

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getFeed();
        if (mounted) setItems(data);
      } catch {
        if (mounted) setErr("Failed to load feed. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let out = items;
    if (category !== "ALL")
      out = out.filter((i) => (i.category || "Other") === category);
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
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Feed</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verified uploads — real photographs and reviewed items appear here.
        </p>
      </div>

      <Card className="mt-4 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-semibold text-slate-700 block">
            Category
          </label>
          <select
            className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 block">
            Sort
          </label>
          <select
            className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="score">Confidence ↓</option>
          </select>
        </div>
      </Card>

      {err && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((i) => <FeedCard key={i.id} item={i} />)}
      </div>

      {!loading && filtered.length === 0 && !err && (
        <div className="mt-12 text-center">
          <div className="text-slate-400 text-4xl mb-3">📭</div>
          <div className="text-sm font-semibold text-slate-700">
            No items yet
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {category !== "ALL"
              ? "Try a different category filter."
              : "Approved uploads will appear here."}
          </div>
        </div>
      )}
    </div>
  );
}
