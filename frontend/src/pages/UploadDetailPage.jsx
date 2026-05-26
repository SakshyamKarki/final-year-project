import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import TrustScoreBar from "../components/ui/TrustScoreBar";
import { LineSkeleton } from "../components/ui/Skeleton";
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
        if (mounted) setErr("Upload not found or you don't have access.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <LineSkeleton className="h-6 w-2/3" />
        <LineSkeleton className="h-4 w-1/3" />
        <LineSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (err) {
    return (
      <div>
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 mb-4">
          {err}
        </div>
        <Link to="/dashboard" className="text-sm text-teal-700 hover:underline">
          ← Back to my uploads
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-4">
      <div>
        <Link
          to="/dashboard"
          className="text-xs text-slate-500 hover:text-slate-700 transition"
        >
          ← My uploads
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            {item.title}
          </h1>
          <div className="text-sm text-slate-500 mt-1">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge value={item.status} />
          {item.moderation_status !== "NONE" && (
            <Badge value={item.moderation_status} />
          )}
        </div>
      </div>
      {/* Verdict summary box */}
      {item.status && (() => {
        const verdictMap = {
          REAL:      { label: "Likely Real Photograph",   cls: "bg-teal-50  border-teal-300  text-teal-800"  },
          UNCERTAIN: { label: "Requires Human Review",    cls: "bg-amber-50 border-amber-300 text-amber-800" },
          AI_GEN:    { label: "Potentially AI Generated", cls: "bg-rose-50  border-rose-300  text-rose-800"  },
        };
        const v = verdictMap[item.status] ?? verdictMap["UNCERTAIN"];
        return (
          <Card className={`p-4 border ${v.cls}`}>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <div className="text-xs font-semibold opacity-70">Verdict</div>
                <div className="text-sm font-bold">{v.label}</div>
              </div>
              <div>
                <div className="text-xs font-semibold opacity-70">Confidence</div>
                <div className="text-sm font-bold">
                  {((item.ai_confidence ?? 0) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold opacity-70">Moderation</div>
                <Badge value={item.moderation_status} />
              </div>
            </div>
          </Card>
        );
      })()}
      <Card className="p-4 space-y-4">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full max-h-[420px] object-cover rounded-2xl"
          />
        )}

        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {item.text}
        </div>

        <TrustScoreBar score={item.trust_score} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Category</div>
            <div className="text-sm font-extrabold text-slate-900">
              {item.category || "Other"}
            </div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Confidence</div>
            <div className="text-sm font-extrabold text-slate-900">
              {((item.ai_confidence ?? 0) * 100).toFixed(1)}%
            </div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Trust score</div>
            <div className="text-sm font-extrabold text-slate-900">
              {(item.trust_score ?? 0).toFixed(2)}
            </div>
          </Card>
          <Card className="p-3 bg-slate-50">
            <div className="text-xs text-slate-500">Category score</div>
            <div className="text-sm font-extrabold text-slate-900">
              {(item.text_similarity_score ?? 0).toFixed(4)}
            </div>
          </Card>
        </div>

        {item.explanation && (
          <Card className="p-4 bg-slate-50">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              Why this verdict?
            </div>
            <div className="text-sm text-slate-700">{item.explanation}</div>
          </Card>
        )}
      </Card>
    </div>
  );
}
