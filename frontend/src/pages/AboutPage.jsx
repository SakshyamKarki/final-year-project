import React from "react";
import Card from "../components/ui/Card";

function Section({ title, children }) {
  return (
    <div>
      <div className="text-sm font-extrabold text-slate-900 mb-2">{title}</div>
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">About</h1>
        <p className="text-sm text-slate-500 mt-1">
          Content Verification System - AI-generated image detection for news media.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <Section title="What this tool does">
          <p className="text-sm text-slate-700 leading-relaxed">
            It analyses whether the image attached to a news article is
            a real photograph or a synthetic (AI-generated) image. Each upload
            receives a <strong>confidence score</strong> and one of three
            verdicts:
          </p>
          <ul className="mt-3 text-sm text-slate-700 space-y-2 pl-4">
            <li>
              <span className="font-semibold text-teal-700">Real</span> — the
              model is ≥&nbsp;80% confident the image is a genuine photograph.
            </li>
            <li>
              <span className="font-semibold text-amber-600">Uncertain</span> —
              confidence is 55–80%; the item is queued for a human moderator to
              review.
            </li>
            <li>
              <span className="font-semibold text-rose-600">AI-generated</span>{" "}
              — the model is &gt;&nbsp;45% confident the image is synthetic.
              Also routed to moderation.
            </li>
          </ul>
        </Section>

        <Section title="The model">
          <p className="text-sm text-slate-700 leading-relaxed">
            The image classifier is a{" "}
            <strong>DenseNet-121 backbone</strong> fine-tuned on the{" "}
            <a
              href="https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images"
              target="_blank"
              rel="noreferrer"
              className="text-teal-700 hover:underline"
            >
              CIFAKE dataset
            </a>{" "}
            (60,000 real CIFAR-10 images + 60,000 Stable Diffusion v1.4
            synthetic equivalents, 32×32 upscaled to 64×64). The model was
            trained end-to-end with mixed-precision on a single T4 GPU and
            achieves &gt;95% test accuracy on CIFAKE.
          </p>
        </Section>

        <Section title="Text categorisation">
          <p className="text-sm text-slate-700 leading-relaxed">
            The article body is classified into a topic category (Politics,
            Business, Technology, Health, Sports, Entertainment, or Other)
            using a lightweight <strong>TF-IDF + cosine similarity</strong>{" "}
            approach against keyword reference documents. Category labels are
            for filtering only and do not influence the authenticity verdict.
          </p>
        </Section>

        <Section title="Limitations & disclaimer">
          <p className="text-sm text-slate-700 leading-relaxed">
            This is an academic prototype. The model was trained on a specific
            distribution of AI-generated images (Stable Diffusion v1.4); it
            may perform differently on images from other generators (DALL·E,
            Midjourney, etc.). The confidence score is a probabilistic signal,
            not a definitive determination of authenticity. Do not rely on it
            as the sole basis for editorial decisions.
          </p>
        </Section>
      </Card>
    </div>
  );
}
