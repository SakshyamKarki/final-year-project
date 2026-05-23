import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { useAuth, isAdmin } from "../app/AuthContext";
import { getModerationQueue, moderateItem } from "../api/moderation";

function ItemCard({ item, onAction }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
          <div className="text-xs text-slate-500 mt-1">
            By {item.uploader_name} • {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge value={item.status} />
          <Badge value={item.moderation_status} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
          {item.image_url ? <img src={item.image_url} alt="" className="w-full h-44 object-cover" /> : null}
        </div>
        <div className="lg:col-span-2">
          <div className="text-xs text-slate-500">Text</div>
          <div className="mt-1 text-sm text-slate-700">{item.text}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              {item.category}
            </span>
            <span className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1">
              Trust: {(item.trust_score ?? 0).toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => onAction(item.id, "approve")}>Approve</Button>
            <Button variant="danger" onClick={() => onAction(item.id, "reject")}>Reject</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ModerationPage() {
  const auth = useAuth();
  const admin = isAdmin(auth.me);

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getModerationQueue();
      setItems(data);
    } catch {
      setErr("Failed to load moderation queue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onAction(id, action) {
    try {
      await moderateItem(id, action);
      await load();
    } catch {
      setErr("Moderation action failed.");
    }
  }

  if (!admin) {
    return (
      <Card className="p-6">
        <div className="text-sm font-bold text-slate-900">Admin only</div>
        <div className="text-sm text-slate-500 mt-1">You don’t have access to moderation.</div>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-xl font-extrabold text-slate-900">Moderation</div>
      <div className="text-sm text-slate-500 mt-1">Review suspicious uploads.</div>

      {err ? <div className="mt-4 text-sm text-rose-600">{err}</div> : null}
      {loading ? <div className="mt-6 text-sm text-slate-500">Loading...</div> : null}

      <div className="mt-6 grid grid-cols-1 gap-4">
        {items.map((i) => (
          <ItemCard key={i.id} item={i} onAction={onAction} />
        ))}
      </div>

      {!loading && items.length === 0 ? (
        <div className="mt-8 text-sm text-slate-500">No items in queue.</div>
      ) : null}
    </div>
  );
}