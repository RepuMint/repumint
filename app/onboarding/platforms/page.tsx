"use client";

import { useActionState } from "react";
import { savePlatformConnections } from "@/app/actions/business";
import type { BusinessSetupState } from "@/app/actions/business";

const inputStyle = {
  width: "100%",
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(11,27,62,0.15)",
  borderRadius: "8px",
  padding: "12px 16px",
  fontSize: "15px",
  color: "#0B1B3E",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "#0B1B3E",
  marginBottom: "6px",
};

const platforms = [
  {
    id: "google",
    name: "Google Business",
    field: "google_place_id",
    placeholder: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    hint: "Find your Place ID at: developers.google.com/maps/documentation/places/web-service/place-id",
    color: "#4285F4",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    id: "yelp",
    name: "Yelp",
    fieldLabel: "Yelp listing URL",
    field: "yelp_url",
    placeholder: "https://www.yelp.com/biz/rusty-anchor-bar-grill-savannah",
    hint: "Paste your full Yelp listing URL. Happy customers will be sent here to leave a review. Yelp reviews aren't aggregated in the dashboard (Yelp API restriction) but they still count.",
    color: "#FF1A1A",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF1A1A">
        <path d="M20.16 12.76l-5.06 1.33c-.79.21-1.49-.49-1.27-1.27l1.33-5.06c.22-.86 1.37-.98 1.74-.19l3.73 4.53c.36.44.14 1.45-.47 1.66zm-7.84 4.41l.95 5.2c.15.85-.78 1.45-1.48.95L7.16 20.1c-.71-.5-.56-1.59.25-1.88l4.44-1.53c.78-.27 1.52.53 1.47 1.38zm-7.2-7.51L.88 6.62c-.6-.7-.09-1.76.82-1.76h5.37c.82 0 1.38.84 1.08 1.6L6.2 11.23c-.29.74-1.37.82-1.08-.57zm1.91 2.97L1.9 14.3c-.84.22-.98-1.37-.19-1.74L6.24 9.83c.44-.36 1.45.14 1.66.76l-.87 1.04z"/>
      </svg>
    ),
  },
  {
    id: "facebook",
    name: "Facebook",
    field: "facebook_page_id",
    placeholder: "RustyAnchorBar",
    hint: "Your Facebook Page username or ID, found in your page settings.",
    color: "#1877F2",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "tripadvisor",
    name: "TripAdvisor",
    field: "tripadvisor_location_id",
    placeholder: "1234567",
    hint: "Your TripAdvisor location ID, found in your listing URL: tripadvisor.com/Restaurant_Review-g...-d1234567",
    color: "#34E0A1",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#34E0A1">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
  },
];

export default function PlatformsPage() {
  const [state, action, pending] = useActionState<BusinessSetupState, FormData>(
    savePlatformConnections,
    null
  );

  return (
    <div>
      <OnboardingSteps current={2} />

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
          Where do happy customers go?
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px", marginBottom: "32px" }}>
          When a customer rates their experience positively, RepuMint sends them here to leave a public review.
          Add the platforms you want to grow. You can change these later in Settings.
        </p>

        {state?.error && (
          <div
            className="mb-6 rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: "rgba(255,100,80,0.06)",
              border: "1px solid rgba(255,100,80,0.2)",
              color: "#FF6450",
            }}
          >
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="rounded-xl p-5"
              style={{ border: "1px solid rgba(11,27,62,0.08)", backgroundColor: "#FAFBFD" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  {platform.icon}
                </div>
                <span style={{ fontWeight: 600, color: "#0B1B3E", fontSize: "15px" }}>
                  {platform.name}
                </span>
              </div>
              <div>
                <label htmlFor={platform.field} style={labelStyle}>
                  {"fieldLabel" in platform ? platform.fieldLabel : `${platform.name} ID`}
                </label>
                <input
                  id={platform.field}
                  name={platform.field}
                  type="text"
                  placeholder={platform.placeholder}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "6px" }}>
                  {platform.hint}
                </p>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <a
              href="/onboarding"
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
                backgroundColor:
                  step.n < current ? "#A8FF3E" : step.n === current ? "#0B1B3E" : "rgba(11,27,62,0.08)",
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
