import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import TrustScoreBar from "../components/ui/TrustScoreBar";
import { CardSkeleton } from "../components/ui/Skeleton";
import { useAuth, isAdmin } from "../app/AuthContext";
import { useToast } from "../app/ToastContext";
import { getModerationQueue, moderateItem } from "../api/moderation";

function QueueCard({ item, onAction }) {
  const [acting, setActing] = useState(null); // "approve" | "reject" | null

  async function handle(action) {
    setActing(action);
    try {
      await onAction(item.id, action);
    } finally {
      setActing(null);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">
            {item.title}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            By {item.uploader_name} •{" "}
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge value={item.status} />
          <Badge value={item.moderation_status} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="w-full h-44 object-cover"
            />
          ) : (
            <div className="w-full h-44 flex items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs text-slate-500 font-semibold">
            Article text
          </div>
          <div className="text-sm text-slate-700 line-clamp-4">
            {item.text}
          </div>

          <TrustScoreBar score={item.trust_score} />

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              {item.category || "Other"}
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              Confidence {((item.ai_confidence ?? 0) * 100).toFixed(1)}%
            </span>
          </div>

          {item.explanation && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
              {item.explanation}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => handle("approve")}
              disabled={!!acting}
            >
              {acting === "approve" ? "Approving…" : "Approve"}
            </Button>
            <Button
              variant="danger"
              onClick={() => handle("reject")}
              disabled={!!acting}
            >
              {acting === "reject" ? "Rejecting…" : "Reject"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ModerationPage() {
  const auth = useAuth();
  const toast = useToast();
  const admin = isAdmin(auth.me);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await getModerationQueue());
    } catch {
      toast.error("Failed to load moderation queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAction(id, action) {
    try {
      await moderateItem(id, action);
      toast.success(
        action === "approve"
          ? "Item approved — it will now appear in the feed."
          : "Item rejected."
      );
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Moderation action failed.");
    }
  }

  if (!admin) {
    return (
      <Card className="p-6">
        <div className="text-sm font-bold text-slate-900">Admin only</div>
        <div className="text-sm text-slate-500 mt-1">
          You don't have access to moderation.
        </div>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900">Moderation</h1>
      <p className="text-sm text-slate-500 mt-1">
        Review uploads the model flagged as AI-generated or uncertain.
        Approved items appear in the public feed.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)
          : items.map((i) => (
              <QueueCard key={i.id} item={i} onAction={onAction} />
            ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="mt-12 text-center">
          <div className="text-slate-300 text-5xl mb-3">✅</div>
          <div className="text-sm font-semibold text-slate-700">
            Queue is empty
          </div>
          <div className="text-xs text-slate-500 mt-1">
            All pending items have been reviewed.
          </div>
        </div>
      )}
    </div>
  );
}
