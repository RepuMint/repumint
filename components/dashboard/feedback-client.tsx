"use client";

import { useState, useTransition, useActionState } from "react";
import { updateFeedbackStatus, saveFeedbackNotes } from "@/app/actions/feedback";
import type { FeedbackStatus } from "@/lib/types/database";

type FeedbackItem = {
  id: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  rating: number | null;
  body: string | null;
  status: FeedbackStatus;
  owner_notes: string | null;
  resolved_at: string | null;
  created_at: string;
};

const STATUS_META: Record<FeedbackStatus, { label: string; color: string; bg: string }> = {
  new:         { label: "New",         color: "#FF6450", bg: "rgba(255,100,80,0.08)" },
  read:        { label: "Read",        color: "#8892A4", bg: "rgba(11,27,62,0.06)"   },
  in_progress: { label: "In progress", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  resolved:    { label: "Resolved",    color: "#45A29E", bg: "rgba(102,252,241,0.08)" },
  ignored:     { label: "Ignored",     color: "#8892A4", bg: "rgba(11,27,62,0.05)"   },
};

const FILTER_TABS: Array<{ value: "all" | FeedbackStatus; label: string }> = [
  { value: "all",         label: "All"         },
  { value: "new",         label: "New"         },
  { value: "in_progress", label: "In progress" },
  { value: "resolved",    label: "Resolved"    },
];

function AmberStars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="13" height="13" viewBox="0 0 24 24" fill={n <= rating ? "#F59E0B" : "rgba(11,27,62,0.1)"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function NotesForm({ item, onClose }: { item: FeedbackItem; onClose: () => void }) {
  const [state, action, pending] = useActionState<{ error?: string } | null, FormData>(saveFeedbackNotes, null);
  const [text, setText] = useState(item.owner_notes ?? "");

  return (
    <form action={action} style={{ marginTop: "14px" }}>
      <input type="hidden" name="feedbackId" value={item.id} />
      {state?.error && <p style={{ fontSize: "12px", color: "#FF6450", marginBottom: "6px" }}>{state.error}</p>}
      <textarea
        name="notes"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Add a private note about this customer…"
        style={{
          width: "100%", borderRadius: "8px", padding: "10px 12px",
          fontSize: "13px", color: "#0B1B3E", lineHeight: "1.6",
          border: "1px solid rgba(11,27,62,0.15)", backgroundColor: "#FAFBFD",
          resize: "none", outline: "none",
          fontFamily: "var(--font-sans)",
        }}
        onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(245,158,11,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
        onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button type="submit" disabled={pending} style={{
          fontSize: "12px", fontWeight: 700, color: "#080f22",
          backgroundColor: pending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
          padding: "6px 14px", borderRadius: "6px", border: "none", cursor: pending ? "not-allowed" : "pointer",
        }}>
          {pending ? "Saving…" : "Save note"}
        </button>
        <button type="button" onClick={onClose} style={{
          fontSize: "12px", color: "#8892A4", background: "none", border: "none", cursor: "pointer",
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [updating, startUpdate] = useTransition();
  const meta = STATUS_META[item.status];

  function setStatus(status: FeedbackStatus) {
    startUpdate(async () => { await updateFeedbackStatus(item.id, status); });
  }

  const initials = (item.contact_name ?? "?")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)",
      borderLeft: item.status === "new" ? "4px solid #FF6450" : "4px solid rgba(11,27,62,0.08)",
      overflow: "hidden",
      opacity: updating ? 0.6 : 1,
      transition: "opacity 150ms ease",
    }}>
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Avatar */}
            <div style={{
              width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
              backgroundColor: "rgba(245,158,11,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: 700, color: "#F59E0B",
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "15px", color: "#0B1B3E", marginBottom: "3px" }}>
                {item.contact_name ?? "Anonymous customer"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {item.rating && <AmberStars rating={item.rating} />}
                <span style={{ fontSize: "12px", color: "#8892A4" }}>{formatDate(item.created_at)}</span>
              </div>
            </div>
          </div>

          <span style={{
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase",
            color: meta.color, backgroundColor: meta.bg,
            padding: "3px 10px", borderRadius: "20px", flexShrink: 0,
            border: `1px solid ${meta.color}30`,
          }}>
            {meta.label}
          </span>
        </div>

        {/* Body */}
        {item.body && (
          <p style={{
            fontSize: "14px", color: "#4A5568", lineHeight: "1.7",
            padding: "12px 14px", backgroundColor: "#F4F6FA",
            borderRadius: "8px", marginBottom: "14px",
            borderLeft: "3px solid rgba(245,158,11,0.4)",
          }}>
            &ldquo;{item.body}&rdquo;
          </p>
        )}

        {/* Contact info */}
        {(item.contact_phone || item.contact_email) && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
            {item.contact_phone && (
              <a href={`tel:${item.contact_phone}`} style={{ fontSize: "13px", color: "#45A29E", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72A16 16 0 0 0 12 15.28l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.06z"/>
                </svg>
                {item.contact_phone}
              </a>
            )}
            {item.contact_email && (
              <a href={`mailto:${item.contact_email}`} style={{ fontSize: "13px", color: "#45A29E", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {item.contact_email}
              </a>
            )}
          </div>
        )}

        {/* Owner notes */}
        {item.owner_notes && !notesOpen && (
          <div style={{
            padding: "10px 12px", backgroundColor: "rgba(11,27,62,0.03)",
            borderRadius: "8px", marginBottom: "12px",
            border: "1px solid rgba(11,27,62,0.06)",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#8892A4", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
              Your note
            </p>
            <p style={{ fontSize: "13px", color: "#4A5568" }}>{item.owner_notes}</p>
          </div>
        )}

        {notesOpen && <NotesForm item={item} onClose={() => setNotesOpen(false)} />}
      </div>

      {/* Action footer */}
      <div style={{
        padding: "10px 20px",
        borderTop: "1px solid rgba(11,27,62,0.05)",
        display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap",
      }}>
        {item.status === "new" && (
          <button onClick={() => setStatus("in_progress")} style={actionBtnStyle("#0B1B3E", "rgba(11,27,62,0.06)")}>
            Mark in progress
          </button>
        )}
        {item.status !== "resolved" && item.status !== "ignored" && (
          <button onClick={() => setStatus("resolved")} style={actionBtnStyle("#45A29E", "rgba(102,252,241,0.08)")}>
            Mark resolved
          </button>
        )}
        {item.status === "resolved" && (
          <button onClick={() => setStatus("new")} style={actionBtnStyle("#8892A4", "rgba(11,27,62,0.05)")}>
            Reopen
          </button>
        )}
        <button onClick={() => setNotesOpen(!notesOpen)} style={actionBtnStyle("#0B1B3E", "rgba(11,27,62,0.05)")}>
          {item.owner_notes ? "Edit note" : "Add note"}
        </button>
        {item.status !== "ignored" && (
          <button onClick={() => setStatus("ignored")} style={{ ...actionBtnStyle("#8892A4", "transparent"), marginLeft: "auto", opacity: 0.6 }}>
            Ignore
          </button>
        )}
      </div>
    </div>
  );
}

function actionBtnStyle(color: string, bg: string): React.CSSProperties {
  return {
    fontSize: "12px", fontWeight: 600, color,
    backgroundColor: bg, border: `1px solid ${color}25`,
    padding: "5px 12px", borderRadius: "7px", cursor: "pointer",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeedbackClient({
  feedback,
  newCount,
}: {
  feedback: FeedbackItem[];
  newCount: number;
}) {
  const [filter, setFilter] = useState<"all" | FeedbackStatus>("all");

  const filtered = filter === "all" ? feedback : feedback.filter((f) => f.status === filter);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "6px" }}>
          Feedback
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>
          {newCount > 0
            ? `${newCount} new private feedback${newCount !== 1 ? "s" : ""} need your attention`
            : feedback.length > 0
            ? "Private feedback from customers who chose not to leave a public review"
            : "Private feedback from unhappy customers will appear here"}
        </p>
      </div>

      {/* Filter tabs */}
      {feedback.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {FILTER_TABS.map((tab) => {
            const count = tab.value === "all" ? feedback.length : feedback.filter((f) => f.status === tab.value).length;
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "7px 14px", borderRadius: "8px",
                  fontSize: "13px", fontWeight: active ? 600 : 400, cursor: "pointer",
                  backgroundColor: active ? "#0B1B3E" : "transparent",
                  color: active ? "#F59E0B" : "#6B7A99",
                  border: active ? "1px solid transparent" : "1px solid rgba(11,27,62,0.1)",
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: "11px", fontFamily: "var(--font-mono)",
                  color: active ? "rgba(245,158,11,0.7)" : "#8892A4",
                  backgroundColor: active ? "rgba(255,255,255,0.08)" : "rgba(11,27,62,0.05)",
                  padding: "1px 6px", borderRadius: "20px",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: "#FFFFFF", borderRadius: "14px",
          border: "1px solid rgba(11,27,62,0.07)",
          padding: "64px 32px", textAlign: "center",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            border: "2px solid #F59E0B", margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0B1B3E", marginBottom: "8px" }}>
            {feedback.length === 0 ? "No feedback yet" : "Nothing in this filter"}
          </h3>
          <p style={{ fontSize: "14px", color: "#4A5568", lineHeight: "1.65", maxWidth: "340px", margin: "0 auto" }}>
            {feedback.length === 0
              ? "When a customer rates their experience below your threshold, they land here instead of a public review platform. You'll be notified immediately."
              : "Try switching to a different filter above."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
