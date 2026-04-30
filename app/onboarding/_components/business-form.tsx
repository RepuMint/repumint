"use client";

import { useActionState } from "react";
import { createBusiness } from "@/app/actions/business";
import type { BusinessSetupState } from "@/app/actions/business";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "salon", label: "Hair Salon" },
  { value: "spa", label: "Spa" },
  { value: "barbershop", label: "Barbershop" },
  { value: "studio", label: "Studio / Fitness" },
  { value: "gym", label: "Gym" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
] as const;

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

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return (
    <p className="mt-1.5 text-sm" style={{ color: "#FF6450" }}>
      {errors[0]}
    </p>
  );
}

export function BusinessSetupForm({ isAddingBusiness }: { isAddingBusiness: boolean }) {
  const [state, action, pending] = useActionState<BusinessSetupState, FormData>(
    createBusiness,
    null
  );

  return (
    <div>
      <OnboardingSteps current={1} />

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
          {isAddingBusiness ? "Add another business" : "Tell us about your business"}
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px", marginBottom: "32px" }}>
          {isAddingBusiness
            ? "Each business gets its own dashboard, links, and review funnel."
            : "We'll use this to set up your review profiles and shareable links."}
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
          {/* Business name */}
          <div>
            <label htmlFor="name" style={labelStyle}>Business name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="The Rusty Anchor Bar & Grill"
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
            <FieldError errors={state?.fieldErrors?.name} />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Business type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-3 transition-all"
                  style={{
                    border: "1px solid rgba(11,27,62,0.12)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "14px",
                    color: "#0B1B3E",
                    fontWeight: 500,
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    required
                    style={{ accentColor: "#A8FF3E" }}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
            <FieldError errors={state?.fieldErrors?.category} />
          </div>

          {/* Phone + email */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" style={labelStyle}>Business phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
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
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Business email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="hello@rustyanchor.com"
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
              <FieldError errors={state?.fieldErrors?.email} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" style={labelStyle}>Street address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="142 Harbor View Drive"
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
          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label htmlFor="city" style={labelStyle}>City</label>
              <input
                id="city"
                name="city"
                type="text"
                required
                placeholder="Savannah"
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
              <FieldError errors={state?.fieldErrors?.city} />
            </div>
            <div className="col-span-1">
              <label htmlFor="state" style={labelStyle}>State</label>
              <input
                id="state"
                name="state"
                type="text"
                required
                maxLength={2}
                placeholder="GA"
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
              <FieldError errors={state?.fieldErrors?.state} />
            </div>
            <div className="col-span-2">
              <label htmlFor="zip" style={labelStyle}>ZIP</label>
              <input
                id="zip"
                name="zip"
                type="text"
                placeholder="31401"
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
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" style={labelStyle}>
              Website{" "}
              <span style={{ color: "#8892A4", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://rustyanchor.com"
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
            <FieldError errors={state?.fieldErrors?.website} />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full rounded-lg py-3 text-[15px]"
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
                  step.n < current
                    ? "#A8FF3E"
                    : step.n === current
                    ? "#0B1B3E"
                    : "rgba(11,27,62,0.08)",
                color:
                  step.n < current
                    ? "#080f22"
                    : step.n === current
                    ? "#A8FF3E"
                    : "#8892A4",
              }}
            >
              {step.n < current ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7l3.5 3.5L12 3.5"
                    stroke="#080f22"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                step.n
              )}
            </div>
            <span
              className="mt-1.5 hidden sm:block"
              style={{
                fontSize: "11px",
                color: step.n === current ? "#0B1B3E" : "#8892A4",
                fontWeight: step.n === current ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="flex-1 mx-2"
              style={{
                height: "2px",
                backgroundColor:
                  step.n < current ? "#A8FF3E" : "rgba(11,27,62,0.1)",
                marginBottom: "16px",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
