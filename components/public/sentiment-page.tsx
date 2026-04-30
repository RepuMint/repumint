"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markRequestClicked } from "@/app/actions/track";

type Platform = { id: string; label: string; url: string; color: string };

const CATEGORY_WORD: Record<string, string> = {
  restaurant: "meal",
  cafe: "visit",
  bar: "visit",
  salon: "appointment",
  spa: "visit",
  barbershop: "cut",
  studio: "class",
  gym: "workout",
  retail: "experience",
  other: "visit",
};

function categoryWord(category: string | null) {
  return CATEGORY_WORD[category ?? "other"] ?? "visit";
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  google: (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  yelp: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF1A1A">
      <path d="M20.16 12.76l-5.06 1.33c-.79.21-1.49-.49-1.27-1.27l1.33-5.06c.22-.86 1.37-.98 1.74-.19l3.73 4.53c.36.44.14 1.45-.47 1.66z"/>
    </svg>
  ),
  facebook: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
};

export function SentimentPage({
  requestId,
  businessName,
  businessCategory,
  logoUrl,
  contactName,
  sentimentFilterEnabled,
  sentimentThreshold,
  platforms,
  token,
}: {
  requestId: string | null;
  businessName: string;
  businessCategory: string | null;
  logoUrl: string | null;
  contactName: string | null;
  sentimentFilterEnabled: boolean;
  sentimentThreshold: number;
  platforms: Platform[];
  token: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"prompt" | "rating" | "platforms">("prompt");
  const [rating, setRating] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const firstName = contactName?.split(" ")[0] ?? null;
  const word = categoryWord(businessCategory);

  function handleHappy() {
    if (sentimentFilterEnabled) {
      setStep("rating");
    } else {
      setStep("platforms");
    }
  }

  function handleRating(stars: number) {
    setRating(stars);
    if (stars > sentimentThreshold) {
      setStep("platforms");
    } else {
      // Route to private feedback
      startTransition(() => {
        if (requestId) {
          markRequestClicked(requestId, null, stars);
        }
        router.push(`/f/${token}?rating=${stars}`);
      });
    }
  }

  function handlePlatform(platform: Platform) {
    startTransition(() => {
      if (requestId) {
        markRequestClicked(requestId, platform.id, rating ?? 5);
      }
      window.location.href = platform.url;
    });
  }

  function handleUnhappy() {
    startTransition(() => {
      if (requestId) markRequestClicked(requestId, null, 1);
      router.push(`/f/${token}`);
    });
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
        {/* Business header */}
        <div style={{
          padding: "28px 28px 24px",
          borderBottom: "1px solid rgba(11,27,62,0.06)",
          textAlign: "center",
        }}>
          {logoUrl ? (
            <img src={logoUrl} alt={businessName}
              style={{ height: "48px", width: "auto", maxWidth: "160px", objectFit: "contain", marginBottom: "12px", display: "block", margin: "0 auto 12px" }}
            />
          ) : (
            <div style={{
              width: "52px", height: "52px", borderRadius: "12px",
              backgroundColor: "rgba(168,255,62,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: "22px", fontWeight: 800, color: "#0B1B3E",
            }}>
              {businessName[0]}
            </div>
          )}
          <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0B1B3E" }}>
            {businessName}
          </p>
        </div>

        {/* Step content */}
        <div style={{ padding: "32px 28px" }}>

          {/* Step 1: Happy / Not happy prompt */}
          {step === "prompt" && (
            <>
              <h2 style={{
                fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px",
                color: "#0B1B3E", marginBottom: "8px", textAlign: "center",
              }}>
                How was your {word}{firstName ? `, ${firstName}` : ""}?
              </h2>
              <p style={{ fontSize: "14px", color: "#8892A4", textAlign: "center", marginBottom: "28px" }}>
                Takes 30 seconds. Your feedback matters to us.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={handleHappy}
                  style={{
                    padding: "16px", borderRadius: "12px",
                    border: "2px solid rgba(168,255,62,0.3)",
                    backgroundColor: "rgba(168,255,62,0.06)",
                    cursor: "pointer", transition: "all 150ms ease",
                    display: "flex", alignItems: "center", gap: "14px",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(168,255,62,0.12)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,255,62,0.5)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(168,255,62,0.06)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,255,62,0.3)"; }}
                >
                  <span style={{ fontSize: "28px" }}>😊</span>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#0B1B3E" }}>It was great!</span>
                </button>

                <button onClick={handleUnhappy}
                  style={{
                    padding: "16px", borderRadius: "12px",
                    border: "2px solid rgba(11,27,62,0.08)",
                    backgroundColor: "transparent",
                    cursor: "pointer", transition: "all 150ms ease",
                    display: "flex", alignItems: "center", gap: "14px",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(11,27,62,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: "28px" }}>😔</span>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#4A5568" }}>Not quite</span>
                </button>
              </div>
            </>
          )}

          {/* Step 2: Star rating (if sentiment filter on + happy was tapped) */}
          {step === "rating" && (
            <>
              <h2 style={{
                fontSize: "20px", fontWeight: 700, color: "#0B1B3E",
                marginBottom: "8px", textAlign: "center",
              }}>
                How many stars?
              </h2>
              <p style={{ fontSize: "14px", color: "#8892A4", textAlign: "center", marginBottom: "28px" }}>
                Tap a star to continue.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => handleRating(star)}
                    style={{
                      width: "52px", height: "52px", borderRadius: "12px",
                      border: "1px solid rgba(11,27,62,0.1)",
                      backgroundColor: "#F4F6FA",
                      cursor: "pointer", fontSize: "24px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 120ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(102,252,241,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#66FCF1";
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F4F6FA";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(11,27,62,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Platform picker */}
          {step === "platforms" && (
            <>
              <h2 style={{
                fontSize: "20px", fontWeight: 700, color: "#0B1B3E",
                marginBottom: "8px", textAlign: "center",
              }}>
                We&apos;re glad to hear it!
              </h2>
              <p style={{ fontSize: "14px", color: "#8892A4", textAlign: "center", marginBottom: "24px" }}>
                Where would you like to leave your review?
              </p>

              {platforms.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#8892A4", textAlign: "center" }}>
                  Thanks for the kind words!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {platforms.map((p) => (
                    <button key={p.id} onClick={() => handlePlatform(p)}
                      style={{
                        padding: "14px 18px", borderRadius: "12px",
                        border: `1px solid ${p.color}30`,
                        backgroundColor: `${p.color}08`,
                        cursor: "pointer", transition: "all 150ms ease",
                        display: "flex", alignItems: "center", gap: "12px",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${p.color}14`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${p.color}08`; }}
                    >
                      {PLATFORM_ICONS[p.id]}
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#0B1B3E" }}>
                        Review us on {p.label}
                      </span>
                      <span style={{ marginLeft: "auto", fontSize: "16px", color: "#8892A4" }}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "11px", color: "rgba(11,27,62,0.25)" }}>
        Powered by RepuMint
      </p>
    </div>
  );
}
