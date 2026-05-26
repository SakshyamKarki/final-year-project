import React, { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import TrustScoreBar from "../components/ui/TrustScoreBar";
import { useToast } from "../app/ToastContext";
import { uploadNews } from "../api/uploads";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function isAllowedImage(file) {
  return file && ALLOWED_TYPES.includes(file.type);
}

function extractError(e) {
  const data = e?.response?.data;
  if (!data) return e?.message || "Upload failed.";
  if (typeof data === "string") return data;
  if (data.code === "model_missing") {
    return "The detection model is not configured on this server. Contact your administrator.";
  }
  return data.detail || data.error || JSON.stringify(data);
}

const BLANK_FORM = { title: "", text: "" };

export default function UploadPage() {
  const toast = useToast();

  const [form, setForm] = useState(BLANK_FORM);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  function resetForm() {
    setForm(BLANK_FORM);
    setFile(null);
    setErr("");
    setProgress(0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      setErr("Please choose an image.");
      return;
    }
    setErr("");
    setResult(null);
    setProgress(0);
    setLoading(true);

    try {
      const data = await uploadNews({
        title: form.title,
        text: form.text,
        imageFile: file,
        onProgress: setProgress,
      });
      setResult(data);
      resetForm();
      toast.success("Upload submitted and analysed.");
    } catch (e2) {
      const msg = extractError(e2);
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function onPickFile(f) {
    if (!f) return;
    if (!isAllowedImage(f)) {
      setErr("Only PNG, JPG, or WEBP images are allowed.");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setErr("Image must be under 15 MB.");
      return;
    }
    setErr("");
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    onPickFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <h1 className="text-xl font-extrabold text-slate-900 mb-1">Upload</h1>
      <p className="text-sm text-slate-500 mb-5">
        Submit a news headline, body text, and an image. Our model will
        analyse whether the image appears to be a real photograph or
        AI-generated.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Form ── */}
        <Card className="p-5">
          <div className="text-base font-extrabold text-slate-900 mb-4">
            Submission
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Headline
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-300"
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                required
                maxLength={250}
                placeholder="Enter a news headline…"
              />
              <div className="text-xs text-slate-400 mt-1 text-right">
                {form.title.length}/250
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Body text
              </label>
              <textarea
                className="mt-1 w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-300"
                value={form.text}
                onChange={(e) =>
                  setForm((s) => ({ ...s, text: e.target.value }))
                }
                required
                maxLength={8000}
                placeholder="Paste or type the article body here…"
              />
              <div className="text-xs text-slate-400 mt-1 text-right">
                {form.text.length}/8000
              </div>
            </div>

            {/* ── Image dropzone ── */}
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Image
              </label>
              <div
                className={[
                  "mt-2 rounded-2xl border-2 border-dashed p-4 transition cursor-default",
                  dragOver
                    ? "border-teal-400 bg-teal-50"
                    : "border-slate-200 bg-white",
                ].join(" ")}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={onDrop}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-bold text-slate-900">
                      {file ? file.name : "Drag & drop an image here"}
                    </div>
                    <div className="text-xs text-slate-500">
                      PNG / JPG / WEBP — max 15 MB
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) =>
                            onPickFile(e.target.files?.[0] || null)
                          }
                        />
                        <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
                          Browse
                        </span>
                      </label>
                      {file && (
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          onClick={() => setFile(null)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="w-20 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                        Preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            {loading && (
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  Uploading… {progress}%
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-teal-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {err && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {err}
              </div>
            )}

            <Button className="w-full" disabled={loading}>
              {loading ? "Analysing…" : "Submit for analysis"}
            </Button>
          </form>
        </Card>

        {/* ── Result panel ── */}
        <Card className="p-5">
          <div className="text-base font-extrabold text-slate-900 mb-1">
            Result
          </div>
          <p className="text-sm text-slate-500 mb-4">
            The model's verdict appears here after submission.
          </p>

            {!result ? (
          <div className="mt-8 text-center">
            <div className="text-slate-300 text-5xl mb-3">🔍</div>
            <div className="text-sm text-slate-400">No result yet.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Verdict header with color emphasis */}
            {(() => {
              const s = result.status;
              const verdictMap = {
                REAL:      { label: "Likely Real Photograph",   cls: "bg-teal-50  border-teal-300  text-teal-800"  },
                UNCERTAIN: { label: "Requires Human Review",    cls: "bg-amber-50 border-amber-300 text-amber-800" },
                AI_GEN:    { label: "Potentially AI Generated", cls: "bg-rose-50  border-rose-300  text-rose-800"  },
              };
              const v = verdictMap[s] ?? verdictMap["UNCERTAIN"];
              return (
                <div className={`rounded-xl border px-4 py-3 font-bold text-sm ${v.cls}`}>
                  {v.label}
                </div>
              );
            })()}

            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-bold text-slate-900 leading-snug">
                {result.title}
              </div>
              <Badge value={result.status} />
            </div>

            {result.image_url && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={result.image_url}
                  alt={result.title}
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            <TrustScoreBar score={result.trust_score} />

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Category</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {result.category || "Other"}
                </div>
              </Card>
              <Card className="p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Model confidence</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {((result.ai_confidence ?? 0) * 100).toFixed(1)}%
                </div>
              </Card>
            </div>

            {result.explanation && (
              <Card className="p-4 bg-slate-50">
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Why this verdict?
                </div>
                <div className="text-sm text-slate-700">{result.explanation}</div>
              </Card>
            )}

            {/* Moderation badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Moderation status:</span>
              <Badge value={result.moderation_status} />
            </div>
          </div>
        )}
        </Card>
      </div>
    </div>
  );
}
