"use client";

import { useActionState, useState } from "react";
import { saveSentimentSettings } from "@/app/actions/business";
import type { BusinessSetupState } from "@/app/actions/business";

export default function SentimentPage() {
  const [state, action, pending] = useActionState<BusinessSetupState, FormData>(
    saveSentimentSettings,
    null
  );
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState(4);

  return (
    <div>
      <OnboardingSteps current={3} />

      <div
        className="mt-8 rounded-[12px] p-8"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(11,27,62,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-1px",
            color: "#0B1B3E",
            marginBottom: "6px",
          }}
        >
          Set up your sentiment filter
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px", marginBottom: "32px" }}>
          Every review request passes through a quick &ldquo;happy or unhappy?&rdquo; check.
          Happy customers get sent to Google, Yelp, or Facebook. Unhappy ones go to a private form — and you&apos;re notified instantly.
        </p>

        {/* How it works visual */}
        <div
          className="mb-8 rounded-xl p-5"
          style={{ backgroundColor: "#F4F6FA", border: "1px solid rgba(11,27,62,0.06)" }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
            The full workflow
          </p>
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-1">
              {[1,2,3,4].map((n, i) => (
                <div key={n} className="flex flex-col items-center gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#A8FF3E", fontSize: "13px", fontWeight: 700, color: "#080f22" }}>{n}</div>
                  {i < 3 && <div style={{ width: "2px", height: "28px", backgroundColor: "rgba(11,27,62,0.1)" }} />}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-6 pt-1">
              <div>
                <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "14px" }}>Customer has an interaction</p>
                <p style={{ color: "#4A5568", fontSize: "13px" }}>A visit, purchase, or appointment at your business.</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "14px" }}>You send a review request</p>
                <p style={{ color: "#4A5568", fontSize: "13px" }}>Via SMS, email, or QR code — at the timing you set.</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "14px" }}>They tell you how they feel</p>
                <p style={{ color: "#4A5568", fontSize: "13px" }}>
                  One tap. Happy or not.{" "}
                  <span style={{ color: "#66FCF1", fontWeight: 500 }}>Happy → Google, Yelp, or Facebook.</span>{" "}
                  <span style={{ color: "#F59E0B", fontWeight: 500 }}>Unhappy → private feedback form only you can see.</span>
                </p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "14px" }}>You&apos;re notified instantly</p>
                <p style={{ color: "#4A5568", fontSize: "13px" }}>Every piece of private feedback triggers an immediate email alert so nothing slips through.</p>
              </div>
            </div>
          </div>
        </div>

        <form action={action} className="space-y-8">
          <input type="hidden" name="sentiment_filter_enabled" value={enabled.toString()} />
          <input type="hidden" name="sentiment_threshold" value={threshold.toString()} />

          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "15px" }}>Enable sentiment filter</p>
              <p style={{ color: "#4A5568", fontSize: "13px", marginTop: "2px" }}>
                Highly recommended — protects your public rating
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className="relative flex h-7 w-12 cursor-pointer items-center rounded-full transition-all"
              style={{
                backgroundColor: enabled ? "#A8FF3E" : "rgba(11,27,62,0.15)",
              }}
            >
              <div
                className="absolute h-5 w-5 rounded-full bg-white transition-all"
                style={{
                  left: enabled ? "calc(100% - 22px)" : "4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>

          {/* Threshold selector */}
          {enabled && (
            <div>
              <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "15px", marginBottom: "4px" }}>
                Send to private feedback when they rate
              </p>
              <p style={{ color: "#4A5568", fontSize: "13px", marginBottom: "16px" }}>
                Customers who tap {threshold} star{threshold !== 1 ? "s" : ""} or below go to your private form instead of a public platform.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setThreshold(star)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: threshold === star ? "#0B1B3E" : "rgba(11,27,62,0.05)",
                      border: threshold === star ? "1px solid #0B1B3E" : "1px solid rgba(11,27,62,0.1)",
                      color: threshold === star ? "#A8FF3E" : "#0B1B3E",
                    }}
                  >
                    {star}★
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "8px" }}>
                Most businesses use 4. Anyone rating below 4 stars goes to your private form — not Google.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <a
              href="/onboarding/platforms"
              className="flex-1 rounded-lg py-3 text-center text-[15px] font-semibold"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid rgba(11,27,62,0.2)",
                color: "#0B1B3E",
              }}
            >
              ← Back
            </a>
            <button
              type="submit"
              disabled={pending}
              className="btn-primary flex-[2] rounded-lg py-3 text-[15px]"
            >
              {pending ? "Saving…" : "Continue →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OnboardingSteps({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Business info" },
    { n: 2, label: "Platforms" },
    { n: 3, label: "Sentiment filter" },
    { n: 4, label: "Done" },
  ];

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: step.n < current ? "#A8FF3E" : step.n === current ? "#0B1B3E" : "rgba(11,27,62,0.08)",
                color: step.n < current ? "#080f22" : step.n === current ? "#A8FF3E" : "#8892A4",
              }}
            >
              {step.n < current ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3.5" stroke="#080f22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : step.n}
            </div>
            <span className="mt-1.5 hidden sm:block" style={{ fontSize: "11px", color: step.n === current ? "#0B1B3E" : "#8892A4", fontWeight: step.n === current ? 600 : 400, whiteSpace: "nowrap" }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mx-2" style={{ height: "2px", backgroundColor: step.n < current ? "#A8FF3E" : "rgba(11,27,62,0.1)", marginBottom: "16px" }} />
          )}
        </div>
      ))}
    </div>
  );
}
