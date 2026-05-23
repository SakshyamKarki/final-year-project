import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { getUpload } from "../api/uploads";

export default function UploadDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const data = await getUpload(id);
        if (mounted) setItem(data);
      } catch {
        setErr("Failed to load upload.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="text-sm text-slate-500">Loading...</div>;
  if (err) return <div className="text-sm text-rose-600">{err}</div>;
  if (!item) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold text-slate-900">{item.title}</div>
          <div className="text-sm text-slate-500 mt-1">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge value={item.status} />
          <Badge value={item.moderation_status} />
        </div>
      </div>

      <Card className="p-4">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full max-h-[420px] object-cover rounded-2xl"
          />
        ) : null}

        <div className="mt-4 text-sm text-slate-700 whitespace-pre-wrap">{item.text}</div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Category</div>
            <div className="text-sm font-extrabold text-slate-900">{item.category || "Other"}</div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Decision score</div>
            <div className="text-sm font-extrabold text-slate-900">
              {(item.trust_score ?? 0).toFixed(2)}
            </div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Model confidence</div>
            <div className="text-sm font-extrabold text-slate-900">
              {(item.ai_confidence ?? 0).toFixed(2)}
            </div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Category score</div>
            <div className="text-sm font-extrabold text-slate-900">
              {(item.text_similarity_score ?? 0).toFixed(4)}
            </div>
          </Card>
        </div>

        {item.explanation ? (
          <Card className="mt-4 p-4 bg-slate-50">
            <div className="text-xs font-semibold text-slate-700">Why this label?</div>
            <div className="mt-2 text-sm text-slate-700">{item.explanation}</div>
          </Card>
        ) : null}
      </Card>
    </div>
  );
}