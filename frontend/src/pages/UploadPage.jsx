import React, { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { uploadNews } from "../api/uploads";

function isAllowedImage(file) {
  if (!file) return false;
  return ["image/png", "image/jpeg", "image/webp"].includes(file.type);
}

function extractError(e) {
  const data = e?.response?.data;
  if (!data) return e?.message || "Upload failed.";
  if (typeof data === "string") return data;
  return data.detail || data.error || JSON.stringify(data);
}

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setResult(null);
    setProgress(0);

    if (!file) {
      setErr("Please choose an image.");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadNews({
        title,
        text,
        imageFile: file,
        onProgress: setProgress,
      });
      setResult(data);
    } catch (e2) {
      setErr(extractError(e2));
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
    setErr("");
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onPickFile(f);
  }

  const sim = result?.text_similarity_score ?? 0;
  const showSim = result && result.category !== "Other" && sim >= 0.01;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <div className="text-xl font-extrabold text-slate-900">Upload</div>
        <div className="text-sm text-slate-500 mt-1">
          Upload news text with an image to get a decision score.
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={250}
            />
            <div className="text-xs text-slate-500 mt-1">{title.length}/250</div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">News text</label>
            <textarea
              className="mt-1 w-full min-h-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-teal-300"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={8000}
            />
            <div className="text-xs text-slate-500 mt-1">{text.length}/8000</div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Image</label>

            <div
              className={[
                "mt-2 rounded-2xl border-2 border-dashed p-4 transition",
                dragOver ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white",
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
                <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold">
                  +
                </div>

                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">
                    Drag & drop an image here
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    PNG/JPG/WEBP up to 15MB
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                      />
                      <span className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
                        Browse file
                      </span>
                    </label>

                    {file ? (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="w-20 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      Preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Uploading: {progress}%</div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div className="h-full bg-teal-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}

          {err ? <div className="text-sm text-rose-600">{err}</div> : null}

          <Button className="w-full" disabled={loading}>
            {loading ? "Analyzing..." : "Submit"}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="text-xl font-extrabold text-slate-900">Result</div>
        <div className="text-sm text-slate-500 mt-1">
          Status is derived from the decision score rules.
        </div>

        {!result ? (
          <div className="mt-6 text-sm text-slate-500">No result yet.</div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-900">{result.title}</div>
              <Badge value={result.status} />
            </div>

            {result.image_url ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={result.image_url} alt={result.title} className="w-full h-56 object-cover" />
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Category</div>
                <div className="text-sm font-extrabold text-slate-900">{result.category}</div>
              </Card>

              <Card className="p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Decision score</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {(result.trust_score ?? 0).toFixed(2)}
                </div>
              </Card>

              <Card className="p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Model confidence</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {(result.ai_confidence ?? 0).toFixed(2)}
                </div>
              </Card>

              {showSim ? (
                <Card className="p-3 bg-slate-50">
                  <div className="text-xs text-slate-500">Category score (TF‑IDF)</div>
                  <div className="text-sm font-extrabold text-slate-900">{sim.toFixed(4)}</div>
                </Card>
              ) : null}
            </div>

            {result.explanation ? (
              <Card className="p-4 bg-slate-50">
                <div className="text-xs font-semibold text-slate-700">Why this label?</div>
                <div className="mt-2 text-sm text-slate-700">{result.explanation}</div>
              </Card>
            ) : null}

            <div className="text-xs text-slate-500">
              Moderation:{" "}
              <span className="font-semibold text-slate-700">{result.moderation_status}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}