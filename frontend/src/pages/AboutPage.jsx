import React from "react";
import Card from "../components/ui/Card";

export default function AboutPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-extrabold text-slate-900">About</div>
        <div className="text-sm text-slate-500 mt-1">
          Media authenticity & news verification project.
        </div>
      </div>

      <Card className="p-6">
        <div className="text-sm font-extrabold text-slate-900">What this app does</div>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700 space-y-2">
          <li>
            Accepts a <span className="font-semibold">news title + text + image</span> and produces a
            <span className="font-semibold"> decision score</span>.
          </li>
          <li>
            Uses an image model (DenseNet121) for authenticity classification (REAL / SUSPICIOUS / FAKE).
          </li>
          <li>
            Uses TF‑IDF + cosine similarity for <span className="font-semibold">topic categorization</span>
            (Politics/Business/Technology/Health/Sports/Entertainment/Other).
          </li>
          <li>
            Suspicious uploads are sent to an <span className="font-semibold">admin moderation queue</span>.
          </li>
        </ul>

        <div className="mt-6 text-sm font-extrabold text-slate-900">How “SUSPICIOUS” works</div>
        <p className="mt-2 text-sm text-slate-700">
          The status is derived from the model confidence thresholds:
          <span className="font-semibold"> REAL ≥ 0.80</span>,
          <span className="font-semibold"> SUSPICIOUS ≥ 0.55</span>, else FAKE.
        </p>

        <div className="mt-6 text-sm font-extrabold text-slate-900">Disclaimer</div>
        <p className="mt-2 text-sm text-slate-700">
          This is a prototype for research/learning. The score is a model confidence signal and should not
          be treated as absolute truth.
        </p>
      </Card>
    </div>
  );
}