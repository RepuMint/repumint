"use client";

import type { Platform } from "@/lib/types/database";

const PLATFORM_COLOR: Record<Platform, string> = {
  google:      "#4285F4",
  yelp:        "#FF1A1A",
  facebook:    "#1877F2",
  tripadvisor: "#00aa6c",
};

const PLATFORM_LABEL: Record<Platform, string> = {
  google:      "Google",
  yelp:        "Yelp",
  facebook:    "Facebook",
  tripadvisor: "TripAdvisor",
};

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)", padding: "20px 24px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8892A4", marginBottom: "10px" }}>
        {label}
      </p>
      <p style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1.5px", color: accent ?? "#66FCF1", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "6px" }}>{sub}</p>}
    </div>
  );
}

// ─── Monthly bar chart (pure CSS) ─────────────────────────────────────────────

function MonthlyChart({ months }: { months: { label: string; count: number; avg: number }[] }) {
  const max = Math.max(...months.map((m) => m.count), 1);

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(11,27,62,0.07)", padding: "24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "20px" }}>
        Reviews per month
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
        {months.map((m, i) => {
          const pct = max > 0 ? (m.count / max) * 100 : 0;
          const isLast = i === months.length - 1;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
              {/* Bar */}
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div
                  title={`${m.count} review${m.count !== 1 ? "s" : ""}`}
                  style={{
                    width: "100%",
                    height: `${Math.max(pct, m.count > 0 ? 4 : 0)}%`,
                    backgroundColor: isLast ? "#66FCF1" : "rgba(102,252,241,0.35)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                    cursor: "default",
                    minHeight: m.count > 0 ? "4px" : "0",
                  }}
                />
              </div>
              {/* Count */}
              {m.count > 0 && (
                <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#0B1B3E", fontWeight: 600 }}>
                  {m.count}
                </span>
              )}
              {/* Label */}
              <span style={{ fontSize: "10px", color: "#8892A4", whiteSpace: "nowrap" }}>{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Platform breakdown ────────────────────────────────────────────────────────

function PlatformBreakdown({ platforms }: {
  platforms: { platform: Platform; total: number; avg: number; fiveStars: number; unresponded: number }[];
}) {
  const max = Math.max(...platforms.map((p) => p.total), 1);

  if (platforms.length === 0) {
    return (
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(11,27,62,0.07)", padding: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
          By platform
        </p>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>No reviews yet.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(11,27,62,0.07)", padding: "24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "20px" }}>
        By platform
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {[...platforms].sort((a, b) => b.total - a.total).map((p) => (
          <div key={p.platform}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  backgroundColor: PLATFORM_COLOR[p.platform],
                }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#0B1B3E" }}>
                  {PLATFORM_LABEL[p.platform]}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "12px", color: "#8892A4" }}>
                  ★ {p.avg.toFixed(1)}
                </span>
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600, color: "#0B1B3E", minWidth: "24px", textAlign: "right" }}>
                  {p.total}
                </span>
              </div>
            </div>
            <div style={{ height: "6px", backgroundColor: "rgba(11,27,62,0.06)", borderRadius: "3px" }}>
              <div style={{
                height: "6px",
                width: `${(p.total / max) * 100}%`,
                backgroundColor: PLATFORM_COLOR[p.platform],
                borderRadius: "3px",
                transition: "width 0.4s ease",
              }} />
            </div>
            {p.unresponded > 0 && (
              <p style={{ fontSize: "11px", color: "#FF6450", marginTop: "4px" }}>
                {p.unresponded} unresponded
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rating distribution ──────────────────────────────────────────────────────

function RatingDistribution({ months }: { months: { count: number; avg: number }[] }) {
  const totalWithData = months.filter((m) => m.count > 0);
  if (totalWithData.length < 2) return null;

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(11,27,62,0.07)", padding: "24px" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "20px" }}>
        Avg rating over time
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "80px" }}>
        {months.map((m, i) => {
          const pct = m.count > 0 ? ((m.avg - 1) / 4) * 100 : 0;
          const color = m.avg >= 4.5 ? "#66FCF1" : m.avg >= 3.5 ? "#A8FF3E" : m.avg >= 2.5 ? "#F59E0B" : "#FF6450";
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                {m.count > 0 && (
                  <div style={{
                    width: "100%", height: `${Math.max(pct, 8)}%`,
                    backgroundColor: color, borderRadius: "3px 3px 0 0",
                    opacity: 0.8,
                  }} />
                )}
              </div>
              <span style={{ fontSize: "9px", color: "#8892A4" }}>
                {months[i].count > 0 ? m.avg.toFixed(1) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsClient({
  summary,
  months,
  platformBreakdown,
}: {
  summary: { totalReviews: number; overallAvg: number; responseRate: number; feedbackCount: number };
  months: { label: string; count: number; avg: number }[];
  platformBreakdown: { platform: Platform; total: number; avg: number; fiveStars: number; unresponded: number }[];
}) {
  const hasData = summary.totalReviews > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "6px" }}>
          Analytics
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>
          {hasData ? "How your reputation is growing across all platforms." : "Sync reviews to start seeing your analytics."}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <SummaryCard label="Total reviews" value={summary.totalReviews} sub="all platforms" />
        <SummaryCard
          label="Average rating"
          value={summary.overallAvg > 0 ? summary.overallAvg.toFixed(1) : "—"}
          sub="out of 5.0"
        />
        <SummaryCard
          label="Response rate"
          value={summary.totalReviews > 0 ? `${summary.responseRate}%` : "—"}
          sub="reviews responded to"
          accent={summary.responseRate >= 80 ? "#66FCF1" : summary.responseRate >= 50 ? "#A8FF3E" : "#FF6450"}
        />
        <SummaryCard
          label="Private feedback"
          value={summary.feedbackCount}
          sub="kept off public platforms"
          accent={summary.feedbackCount > 0 ? "#F59E0B" : "#66FCF1"}
        />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Monthly chart — takes 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <MonthlyChart months={months} />
            <RatingDistribution months={months} />
          </div>

          {/* Platform breakdown */}
          <div>
            <PlatformBreakdown platforms={platformBreakdown} />
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: "#FFFFFF", borderRadius: "14px",
          border: "1px solid rgba(11,27,62,0.07)",
          padding: "64px 32px", textAlign: "center",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            border: "2px solid #66FCF1", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#66FCF1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0B1B3E", marginBottom: "8px" }}>No data yet</h3>
          <p style={{ fontSize: "14px", color: "#4A5568", maxWidth: "320px", margin: "0 auto 20px", lineHeight: "1.65" }}>
            Once customers respond to your review requests, your growth trends will appear here.
          </p>
          <a href="/dashboard" style={{
            fontSize: "13px", fontWeight: 700, color: "#080f22",
            backgroundColor: "#A8FF3E", padding: "8px 18px",
            borderRadius: "8px", textDecoration: "none",
          }}>
            Go to Reviews →
          </a>
        </div>
      )}
    </div>
  );
}
