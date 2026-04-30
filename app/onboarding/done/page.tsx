"use client";

import { useTransition } from "react";
import { completeOnboarding } from "@/app/actions/business";

export default function OnboardingDonePage() {
  const [pending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(async () => {
      await completeOnboarding();
    });
  }

  return (
    <div>
      <OnboardingSteps current={4} />

      <div
        className="mt-8 rounded-[12px] p-8 text-center"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(11,27,62,0.08)",
        }}
      >
        {/* Checkmark */}
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(168,255,62,0.15)" }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M5 14l6 6L23 8"
              stroke="#A8FF3E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-1px",
            color: "#0B1B3E",
            marginBottom: "12px",
          }}
        >
          You&apos;re all set.
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px", lineHeight: "1.65", maxWidth: "400px", margin: "0 auto" }}>
          Your 7-day free trial has started. Start sending review requests and
          let RepuMint handle the routing.
        </p>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: "📨",
              title: "Send review requests",
              body: "SMS or email after every visit. Customers respond in one tap.",
            },
            {
              icon: "🛡️",
              title: "Protect your rating",
              body: "Happy → Google, Yelp, or Facebook. Unhappy → private form. You're notified instantly.",
            },
            {
              icon: "📈",
              title: "Watch it grow",
              body: "Track review count and average rating across all platforms in one place.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl p-4"
              style={{ backgroundColor: "#F4F6FA", border: "1px solid rgba(11,27,62,0.06)" }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{feature.icon}</div>
              <p style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "14px", marginBottom: "4px" }}>
                {feature.title}
              </p>
              <p style={{ color: "#4A5568", fontSize: "13px", lineHeight: "1.5" }}>{feature.body}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleComplete}
          disabled={pending}
          className="btn-primary mt-8 w-full max-w-[300px] rounded-lg py-3.5 text-[15px]"
        >
          {pending ? "Opening dashboard…" : "Go to dashboard →"}
        </button>

        <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "12px" }}>
          No credit card required · Cancel anytime
        </p>
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
                backgroundColor: step.n <= current ? "#A8FF3E" : "rgba(11,27,62,0.08)",
                color: step.n <= current ? "#080f22" : "#8892A4",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3.5" stroke="#080f22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="mt-1.5 hidden sm:block" style={{ fontSize: "11px", color: step.n === current ? "#0B1B3E" : "#8892A4", fontWeight: step.n === current ? 600 : 400, whiteSpace: "nowrap" }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mx-2" style={{ height: "2px", backgroundColor: "#A8FF3E", marginBottom: "16px" }} />
          )}
        </div>
      ))}
    </div>
  );
}
