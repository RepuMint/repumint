"use client";

import { useState, useTransition, useActionState } from "react";
import { syncAllReviews, type SyncResult } from "@/app/actions/sync";
import { respondToReview, type RespondState } from "@/app/actions/reviews";
import type { Platform, ReviewStatus } from "@/lib/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  platform: Platform;
  reviewer_name: string | null;
  rating: number;
  body: string | null;
  response_text: string | null;
  responded_at: string | null;
  status: ReviewStatus;
  review_date: string | null;
  review_url: string | null;
  external_id: string | null;
};

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM: Record<Platform, {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}> = {
  google: {
    label: "Google",
    color: "#4285F4",
    bg: "rgba(66,133,244,0.1)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  yelp: {
    label: "Yelp",
    color: "#FF1A1A",
    bg: "rgba(255,26,26,0.1)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF1A1A">
        <path d="M20.16 12.76l-5.06 1.33c-.79.21-1.49-.49-1.27-1.27l1.33-5.06c.22-.86 1.37-.98 1.74-.19l3.73 4.53c.36.44.14 1.45-.47 1.66z"/>
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  tripadvisor: {
    label: "TripAdvisor",
    color: "#00aa6c",
    bg: "rgba(0,170,108,0.1)",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#00aa6c">
        <circle cx="6.5" cy="13" r="3.5"/><circle cx="17.5" cy="13" r="3.5"/>
        <path d="M12 7a8 8 0 0 0-7.94 7h2.44a5.5 5.5 0 0 1 11 0h2.44A8 8 0 0 0 12 7z"/>
      </svg>
    ),
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? "#66FCF1" : "rgba(11,27,62,0.12)"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function Avatar({ name, color }: { name: string | null; color: string }) {
  const initial = (name ?? "?")[0].toUpperCase();
  return (
    <div style={{
      width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
      backgroundColor: color + "22",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: "15px", color,
    }}>
      {initial}
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

// ─── Respond form ─────────────────────────────────────────────────────────────

function RespondForm({ review, onClose }: { review: Review; onClose: () => void }) {
  const [state, action, pending] = useActionState<RespondState, FormData>(respondToReview, null);
  const [text, setText] = useState(review.response_text ?? "");
  const p = PLATFORM[review.platform];

  if (review.platform === "facebook") {
    return (
      <div style={{ marginTop: "16px", padding: "14px 16px", backgroundColor: "#F4F6FA", borderRadius: "10px" }}>
        <p style={{ fontSize: "13px", color: "#4A5568", lineHeight: "1.6", marginBottom: "12px" }}>
          Facebook doesn&apos;t support API responses to recommendations.
          Reply directly in Facebook Business Suite.
        </p>
        <div className="flex gap-3">
          <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "13px", fontWeight: 600, color: "#080f22", backgroundColor: "#A8FF3E", padding: "7px 14px", borderRadius: "7px", textDecoration: "none" }}>
            Open Business Suite →
          </a>
          <button onClick={onClose}
            style={{ fontSize: "13px", color: "#8892A4", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (review.platform === "tripadvisor") {
    return (
      <div style={{ marginTop: "16px", padding: "14px 16px", backgroundColor: "#F4F6FA", borderRadius: "10px" }}>
        <p style={{ fontSize: "13px", color: "#4A5568", lineHeight: "1.6", marginBottom: "12px" }}>
          TripAdvisor requires responses to be posted through their Management Center.
        </p>
        <div className="flex gap-3">
          <a href={review.review_url ?? "https://www.tripadvisor.com/ManagementCenter"} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "13px", fontWeight: 600, color: "#080f22", backgroundColor: "#A8FF3E", padding: "7px 14px", borderRadius: "7px", textDecoration: "none" }}>
            Open TripAdvisor →
          </a>
          <button onClick={onClose}
            style={{ fontSize: "13px", color: "#8892A4", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} style={{ marginTop: "16px" }}>
      <input type="hidden" name="reviewId" value={review.id} />
      {state?.error && (
        <p style={{ fontSize: "12px", color: "#FF6450", marginBottom: "8px" }}>{state.error}</p>
      )}
      <textarea
        name="responseText"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={`Respond as the owner on ${p.label}…`}
        required
        style={{
          width: "100%", borderRadius: "8px", padding: "12px 14px",
          fontSize: "14px", lineHeight: "1.6", color: "#0B1B3E",
          border: "1px solid rgba(11,27,62,0.15)",
          backgroundColor: "#FAFBFD", resize: "none", outline: "none",
          fontFamily: "var(--font-sans)",
        }}
        onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      <div className="flex items-center gap-3 mt-2">
        <button type="submit" disabled={pending || !text.trim()}
          style={{
            fontSize: "13px", fontWeight: 700, color: "#080f22",
            backgroundColor: (!pending && text.trim()) ? "#A8FF3E" : "rgba(168,255,62,0.4)",
            padding: "7px 16px", borderRadius: "7px", border: "none",
            cursor: (!pending && text.trim()) ? "pointer" : "not-allowed",
          }}>
          {pending ? "Posting…" : "Post response"}
        </button>
        <button type="button" onClick={onClose}
          style={{ fontSize: "13px", color: "#8892A4", background: "none", border: "none", cursor: "pointer" }}>
          Cancel
        </button>
        <span style={{ marginLeft: "auto", fontSize: "11px", color: text.length > 3800 ? "#FF6450" : "#8892A4", fontVariantNumeric: "tabular-nums" }}>
          {text.length}/4000
        </span>
      </div>
    </form>
  );
}

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [responding, setResponding] = useState(false);
  const p = PLATFORM[review.platform];
  const body = review.body ?? "";
  const isLong = body.length > 280;
  const displayBody = isLong && !expanded ? body.slice(0, 280).trimEnd() + "…" : body;

  return (
    <article
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        border: "1px solid rgba(11,27,62,0.07)",
        borderLeft: `4px solid ${p.color}`,
        overflow: "hidden",
        transition: "box-shadow 150ms ease, transform 150ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(11,27,62,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <div style={{ padding: "20px 20px 0 20px" }}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={review.reviewer_name} color={p.color} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p style={{ fontWeight: 700, fontSize: "15px", color: "#0B1B3E", lineHeight: 1.3 }}>
                  {review.reviewer_name ?? "Anonymous"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRow rating={review.rating} />
                  <span style={{ fontSize: "12px", color: "#8892A4" }}>
                    {formatDate(review.review_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {review.status === "unresponded" && (
                  <span style={{
                    fontSize: "11px", fontWeight: 600, color: "#FF6450",
                    backgroundColor: "rgba(255,100,80,0.08)",
                    border: "1px solid rgba(255,100,80,0.18)",
                    padding: "2px 8px", borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}>
                    Needs reply
                  </span>
                )}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "11px", fontWeight: 600, color: p.color,
                  backgroundColor: p.bg, padding: "3px 8px", borderRadius: "20px",
                }}>
                  {p.icon} {p.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        {body && (
          <div style={{ marginTop: "14px" }}>
            <p style={{
              fontSize: "14px", lineHeight: "1.7", color: "#4A5568",
            }}>
              {displayBody}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  fontSize: "12px", fontWeight: 600, color: "#45A29E",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 0", marginTop: "2px",
                }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Existing response */}
        {review.response_text && (
          <div style={{
            marginTop: "14px",
            padding: "12px 14px",
            backgroundColor: "rgba(102,252,241,0.05)",
            borderRadius: "8px",
            borderLeft: "3px solid #66FCF1",
          }}>
            <p style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#45A29E", marginBottom: "5px",
            }}>
              Your response
            </p>
            <p style={{ fontSize: "13px", color: "#4A5568", lineHeight: "1.6" }}>
              {review.response_text}
            </p>
          </div>
        )}

        {/* Respond form */}
        {responding && (
          <RespondForm review={review} onClose={() => setResponding(false)} />
        )}
      </div>

      {/* Footer */}
      {!responding && (
        <div
          className="flex items-center justify-between"
          style={{
            padding: "10px 20px",
            marginTop: "14px",
            borderTop: "1px solid rgba(11,27,62,0.05)",
          }}
        >
          {review.responded_at ? (
            <span style={{ fontSize: "12px", color: "#45A29E", display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Responded {formatDate(review.responded_at)}
            </span>
          ) : (
            <span style={{ fontSize: "12px", color: "#8892A4" }}>
              {review.review_url ? (
                <a href={review.review_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "#8892A4", textDecoration: "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#0B1B3E"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8892A4"; }}>
                  View on {p.label} ↗
                </a>
              ) : null}
            </span>
          )}

          <button
            onClick={() => setResponding(true)}
            style={{
              fontSize: "12px", fontWeight: 600,
              color: "#45A29E",
              backgroundColor: "transparent",
              border: "1px solid rgba(10,171,124,0.3)",
              padding: "5px 12px", borderRadius: "7px", cursor: "pointer",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(102,252,241,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(102,252,241,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(10,171,124,0.3)";
            }}
          >
            {review.response_text ? "Edit reply" : "Reply"}
          </button>
        </div>
      )}
    </article>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)",
      padding: "20px 24px",
    }}>
      <p style={{
        fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#8892A4", marginBottom: "10px",
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "36px", fontWeight: 800, letterSpacing: "-1.5px",
        color: accent ?? "#66FCF1",
        fontFamily: "var(--font-mono)",
        lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "6px" }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Platform tab ─────────────────────────────────────────────────────────────

type FilterPlatform = "all" | Platform;

function PlatformTab({
  platform,
  count,
  active,
  onClick,
}: {
  platform: FilterPlatform;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const meta = platform === "all" ? null : PLATFORM[platform];

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "7px 14px", borderRadius: "8px",
        fontSize: "13px", fontWeight: active ? 600 : 400, cursor: "pointer",
        backgroundColor: active ? "#0B1B3E" : "transparent",
        color: active ? "#66FCF1" : "#6B7A99",
        border: active ? "1px solid transparent" : "1px solid rgba(11,27,62,0.1)",
        transition: "all 120ms ease",
      }}
    >
      {meta?.icon}
      {platform === "all" ? "All" : meta!.label}
      <span style={{
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        color: active ? "rgba(102,252,241,0.7)" : "#8892A4",
        backgroundColor: active ? "rgba(255,255,255,0.08)" : "rgba(11,27,62,0.05)",
        padding: "1px 6px", borderRadius: "20px",
      }}>
        {count}
      </span>
    </button>
  );
}

// ─── Getting started / empty state ───────────────────────────────────────────

const WORKFLOW_STEPS = [
  {
    n: 1,
    color: "#A8FF3E",
    title: "Customer visits your business",
    body: "A meal, a haircut, a class — any interaction.",
  },
  {
    n: 2,
    color: "#A8FF3E",
    title: "You send a review request",
    body: "SMS or email, automatically or manually — at the timing you set.",
    action: { label: "Send your first request →", href: "/generate" },
  },
  {
    n: 3,
    color: "#66FCF1",
    title: "Happy customers go public",
    body: "One tap sends them to Google, Yelp, or Facebook to leave a real review.",
  },
  {
    n: 4,
    color: "#F59E0B",
    title: "Unhappy customers stay private",
    body: "They see a private form instead. You're notified instantly — nothing hits a public platform.",
  },
  {
    n: 5,
    color: "#66FCF1",
    title: "Reviews appear right here",
    body: "RepuMint pulls them in from every connected platform so you can respond in one place.",
  },
];

function EmptyState({ hasConnected }: { hasConnected: boolean }) {
  return (
    <div>
      {/* Hero message */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "14px",
        border: "1px solid rgba(11,27,62,0.07)",
        padding: "36px 40px",
        marginBottom: "16px",
      }}>
        <p style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.09em",
          textTransform: "uppercase", color: "#A8FF3E", marginBottom: "10px",
        }}>
          How RepuMint works
        </p>
        <h2 style={{
          fontSize: "24px", fontWeight: 700, letterSpacing: "-0.75px",
          color: "#0B1B3E", marginBottom: "8px",
        }}>
          Every visit is a chance for a 5-star review.
        </h2>
        <p style={{ fontSize: "15px", color: "#4A5568", lineHeight: "1.65", maxWidth: "520px" }}>
          RepuMint turns your customer interactions into public reviews — while quietly
          catching unhappy customers before they reach Google or Yelp.
        </p>
      </div>

      {/* Workflow steps */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "14px",
        border: "1px solid rgba(11,27,62,0.07)",
        overflow: "hidden",
        marginBottom: "16px",
      }}>
        {WORKFLOW_STEPS.map((step, i) => (
          <div key={step.n} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            padding: "20px 28px",
            borderBottom: i < WORKFLOW_STEPS.length - 1 ? "1px solid rgba(11,27,62,0.05)" : "none",
          }}>
            {/* Step number + connector */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: "2px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                backgroundColor: step.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, color: "#080f22",
              }}>
                {step.n}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E", marginBottom: "3px" }}>
                {step.title}
              </p>
              <p style={{ fontSize: "13px", color: "#4A5568", lineHeight: "1.6" }}>
                {step.body}
              </p>
              {step.action && (
                <a
                  href={step.action.href}
                  style={{
                    display: "inline-block", marginTop: "10px",
                    fontSize: "13px", fontWeight: 700, color: "#080f22",
                    backgroundColor: "#A8FF3E",
                    padding: "7px 16px", borderRadius: "7px",
                    textDecoration: "none",
                  }}
                >
                  {step.action.label}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Platform connection nudge */}
      {!hasConnected && (
        <div style={{
          backgroundColor: "rgba(168,255,62,0.07)",
          border: "1px solid rgba(168,255,62,0.2)",
          borderRadius: "12px",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E", marginBottom: "3px" }}>
              Connect your review platforms first
            </p>
            <p style={{ fontSize: "13px", color: "#4A5568" }}>
              RepuMint needs to know where to send happy customers — Google, Yelp, Facebook.
            </p>
          </div>
          <a href="/settings" style={{
            flexShrink: 0, fontSize: "13px", fontWeight: 700,
            color: "#080f22", backgroundColor: "#A8FF3E",
            padding: "9px 18px", borderRadius: "8px", textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            Go to Settings →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReviewsClient({
  reviews,
  stats,
  connectedPlatforms,
  yelpUrl,
}: {
  reviews: Review[];
  stats: { totalReviews: number; totalUnresponded: number; overallAvg: number };
  connectedPlatforms: Platform[];
  yelpUrl: string | null;
}) {
  const [filter, setFilter] = useState<FilterPlatform>("all");
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncing, startSync] = useTransition();

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.platform === filter);

  const tabPlatforms: FilterPlatform[] = ["all", "google", "facebook", "tripadvisor"];

  function handleSync() {
    startSync(async () => {
      const result = await syncAllReviews();
      setSyncResult(result);
    });
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8" style={{ gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "4px" }}>
            Reviews
          </h1>
          <p style={{ fontSize: "14px", color: "#8892A4" }}>
            {syncResult
              ? `Synced ${syncResult.total} review${syncResult.total !== 1 ? "s" : ""} just now`
              : stats.totalReviews > 0
              ? `${stats.totalReviews} public reviews · ${stats.totalUnresponded} need a reply`
              : "Reviews from happy customers will appear here"}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            fontSize: "13px", fontWeight: 600,
            color: syncing ? "#8892A4" : "#0B1B3E",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(11,27,62,0.15)",
            padding: "9px 16px", borderRadius: "8px", cursor: syncing ? "not-allowed" : "pointer",
            flexShrink: 0, transition: "all 120ms ease",
            boxShadow: "0 1px 3px rgba(11,27,62,0.05)",
          }}
          onMouseEnter={(e) => { if (!syncing) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(11,27,62,0.3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(11,27,62,0.15)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}>
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          {syncing ? "Syncing…" : "Sync now"}
        </button>
      </div>

      {/* Sync errors */}
      {syncResult && (syncResult.google.error || syncResult.facebook.error || syncResult.tripadvisor.error) && (
        <div style={{
          marginBottom: "24px", padding: "12px 16px", borderRadius: "10px",
          backgroundColor: "rgba(255,100,80,0.06)", border: "1px solid rgba(255,100,80,0.15)",
        }}>
          {[
            { platform: "Google", err: syncResult.google.error },
            { platform: "Facebook", err: syncResult.facebook.error },
            { platform: "TripAdvisor", err: syncResult.tripadvisor.error },
          ].filter((e) => e.err).map(({ platform, err }) => (
            <p key={platform} style={{ fontSize: "13px", color: "#FF6450" }}>
              <strong>{platform}:</strong> {err}
            </p>
          ))}
        </div>
      )}

      {/* Stats — only shown once there's data */}
      {stats.totalReviews > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total reviews" value={stats.totalReviews} sub="across all platforms" />
          <StatCard label="Average rating" value={stats.overallAvg.toFixed(1)} sub="out of 5.0" />
          <StatCard
            label="Needs reply"
            value={stats.totalUnresponded}
            sub={stats.totalUnresponded === 0 ? "All caught up" : "awaiting response"}
            accent={stats.totalUnresponded > 0 ? "#FF6450" : "#66FCF1"}
          />
        </div>
      )}

      {/* Platform filter tabs — only shown when reviews exist */}
      {reviews.length > 0 && <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabPlatforms.map((p) => {
          const count = p === "all" ? reviews.length : reviews.filter((r) => r.platform === p).length;
          return (
            <PlatformTab
              key={p}
              platform={p}
              count={count}
              active={filter === p}
              onClick={() => setFilter(p)}
            />
          );
        })}

        {yelpUrl && (
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "8px",
              fontSize: "13px", color: "#FF1A1A",
              border: "1px solid rgba(255,26,26,0.2)",
              backgroundColor: "rgba(255,26,26,0.04)",
              textDecoration: "none",
            }}
          >
            {PLATFORM.yelp.icon} Yelp
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        )}
      </div>}

      {/* Review list or getting-started state */}
      {filtered.length === 0 ? (
        <EmptyState hasConnected={connectedPlatforms.length > 0} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
