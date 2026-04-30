"use client";

import { useActionState } from "react";
import { submitFeedback } from "@/app/actions/submit-feedback";

export type FeedbackFormState = { error?: string; submitted?: boolean } | null;

export function FeedbackFormPage({
  requestId,
  businessId,
  businessName,
  logoUrl,
  contactName,
  contactPhone,
  contactEmail,
  initialRating,
}: {
  requestId: string;
  businessId: string;
  businessName: string;
  logoUrl: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  initialRating: number | null;
}) {
  const [state, action, pending] = useActionState<FeedbackFormState, FormData>(
    submitFeedback,
    null
  );

  if (state?.submitted) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#F4F6FA",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "24px 16px",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: "400px", backgroundColor: "#FFFFFF",
          borderRadius: "20px", border: "1px solid rgba(11,27,62,0.08)",
          boxShadow: "0 8px 40px rgba(11,27,62,0.08)",
          padding: "48px 32px", textAlign: "center",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            backgroundColor: "rgba(168,255,62,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8FF3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#0B1B3E", marginBottom: "10px" }}>
            Thank you for telling us.
          </h2>
          <p style={{ fontSize: "15px", color: "#4A5568", lineHeight: "1.65" }}>
            {businessName} will follow up with you directly. We appreciate you giving us the chance to make it right.
          </p>
        </div>
        <p style={{ marginTop: "20px", fontSize: "11px", color: "rgba(11,27,62,0.25)" }}>
          Powered by RepuMint
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#F4F6FA",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      fontFamily: "var(--font-sans), system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        backgroundColor: "#FFFFFF", borderRadius: "20px",
        border: "1px solid rgba(11,27,62,0.08)",
        boxShadow: "0 8px 40px rgba(11,27,62,0.08)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 28px",
          borderBottom: "1px solid rgba(11,27,62,0.06)",
          textAlign: "center",
        }}>
          {logoUrl ? (
            <img src={logoUrl} alt={businessName}
              style={{ height: "40px", maxWidth: "140px", objectFit: "contain", display: "block", margin: "0 auto 10px" }}
            />
          ) : (
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              backgroundColor: "rgba(245,158,11,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 10px",
              fontSize: "20px", fontWeight: 800, color: "#0B1B3E",
            }}>
              {businessName[0]}
            </div>
          )}
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0B1B3E" }}>
            {businessName}
          </p>
        </div>

        <div style={{ padding: "28px" }}>
          <h2 style={{
            fontSize: "20px", fontWeight: 700, color: "#0B1B3E",
            marginBottom: "8px",
          }}>
            We&apos;re sorry to hear that.
          </h2>
          <p style={{ fontSize: "14px", color: "#4A5568", lineHeight: "1.65", marginBottom: "24px" }}>
            Tell us what happened — it goes straight to the owner, not to any public platform.
          </p>

          {state?.error && (
            <div style={{
              padding: "12px 14px", borderRadius: "8px", marginBottom: "16px",
              backgroundColor: "rgba(255,100,80,0.06)", border: "1px solid rgba(255,100,80,0.2)",
              fontSize: "13px", color: "#FF6450",
            }}>
              {state.error}
            </div>
          )}

          <form action={action} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="businessId" value={businessId} />
            {initialRating && <input type="hidden" name="rating" value={initialRating} />}

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
                Name <span style={{ color: "#8892A4", fontWeight: 400 }}>(optional)</span>
              </label>
              <input name="contact_name" defaultValue={contactName ?? ""} placeholder="Your name"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid rgba(11,27,62,0.15)", fontSize: "14px",
                  color: "#0B1B3E", outline: "none", backgroundColor: "#FFFFFF",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
                What happened?
              </label>
              <textarea name="body" required rows={5}
                placeholder="Tell us what we could have done better…"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "8px",
                  border: "1px solid rgba(11,27,62,0.15)", fontSize: "14px",
                  color: "#0B1B3E", outline: "none", resize: "none",
                  backgroundColor: "#FFFFFF", lineHeight: "1.6",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,158,11,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
                  Phone <span style={{ color: "#8892A4", fontWeight: 400 }}>(opt)</span>
                </label>
                <input name="contact_phone" type="tel" defaultValue={contactPhone ?? ""}
                  placeholder="(555) 000-0000"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.15)", fontSize: "13px", color: "#0B1B3E", outline: "none", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
                  Email <span style={{ color: "#8892A4", fontWeight: 400 }}>(opt)</span>
                </label>
                <input name="contact_email" type="email" defaultValue={contactEmail ?? ""}
                  placeholder="you@email.com"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.15)", fontSize: "13px", color: "#0B1B3E", outline: "none", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,158,11,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; }}
                />
              </div>
            </div>

            <button type="submit" disabled={pending}
              style={{
                padding: "14px", borderRadius: "10px", border: "none",
                fontSize: "15px", fontWeight: 700,
                backgroundColor: pending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
                color: "#080f22", cursor: pending ? "not-allowed" : "pointer",
                marginTop: "4px",
              }}>
              {pending ? "Sending…" : "Send feedback"}
            </button>
          </form>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "11px", color: "rgba(11,27,62,0.25)" }}>
        Powered by RepuMint
      </p>
    </div>
  );
}
