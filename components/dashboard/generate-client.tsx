"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { sendReviewRequest, type RequestState } from "@/app/actions/requests";

type RecentRequest = {
  id: string;
  channel: string;
  status: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  sent_at: string | null;
  created_at: string;
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:       { label: "Pending",      color: "#8892A4" },
  sent:          { label: "Sent",         color: "#66FCF1" },
  opened:        { label: "Opened",       color: "#A8FF3E" },
  clicked:       { label: "Clicked",      color: "#A8FF3E" },
  reviewed:      { label: "Reviewed ✓",  color: "#45A29E" },
  feedback_given:{ label: "Feedback",     color: "#F59E0B" },
  failed:        { label: "Failed",       color: "#FF6450" },
};

function formatAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── QR code component ────────────────────────────────────────────────────────

function QRCodeCard({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: { dark: "#0B1B3E", light: "#FFFFFF" },
    }).then(setDataUrl).catch(console.error);
  }, [url]);

  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)", padding: "24px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
        QR Code
      </p>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" style={{ width: "120px", height: "120px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.08)" }} />
        ) : (
          <div style={{ width: "120px", height: "120px", borderRadius: "8px", backgroundColor: "#F4F6FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", color: "#8892A4" }}>Loading…</span>
          </div>
        )}

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", color: "#4A5568", lineHeight: "1.65", marginBottom: "16px" }}>
            Print this on your receipts, table tents, or counter card.
            Customers scan it and go straight to the review flow.
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {dataUrl && (
              <a href={dataUrl} download="repumint-qr.png"
                style={{
                  fontSize: "13px", fontWeight: 700, color: "#080f22",
                  backgroundColor: "#A8FF3E", padding: "8px 16px",
                  borderRadius: "8px", textDecoration: "none",
                }}>
                Download PNG
              </a>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(url)}
              style={{
                fontSize: "13px", fontWeight: 600, color: "#0B1B3E",
                backgroundColor: "#FFFFFF", border: "1px solid rgba(11,27,62,0.15)",
                padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              }}
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shareable link card ──────────────────────────────────────────────────────

function ShareableLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)", padding: "24px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
        Shareable link
      </p>
      <p style={{ fontSize: "14px", color: "#4A5568", lineHeight: "1.65", marginBottom: "16px" }}>
        One permanent URL for your business. Drop it in your email signature, Instagram bio, Google Business description, or anywhere else.
      </p>

      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{
          flex: 1, padding: "10px 14px", borderRadius: "8px",
          backgroundColor: "#F4F6FA", border: "1px solid rgba(11,27,62,0.08)",
          fontSize: "13px", color: "#4A5568", fontFamily: "var(--font-mono)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {url}
        </div>
        <button onClick={handleCopy}
          style={{
            fontSize: "13px", fontWeight: 700, flexShrink: 0,
            color: copied ? "#45A29E" : "#080f22",
            backgroundColor: copied ? "rgba(102,252,241,0.15)" : "#A8FF3E",
            border: copied ? "1px solid rgba(102,252,241,0.3)" : "none",
            padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
            transition: "all 150ms ease",
          }}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ─── Send form ────────────────────────────────────────────────────────────────

function SendForm({ hasAnyPlatform }: { hasAnyPlatform: boolean }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(sendReviewRequest, null);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  if (!hasAnyPlatform) {
    return (
      <div style={{
        padding: "20px", borderRadius: "10px",
        backgroundColor: "rgba(168,255,62,0.07)",
        border: "1px solid rgba(168,255,62,0.2)",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E", marginBottom: "4px" }}>
          Connect a platform first
        </p>
        <p style={{ fontSize: "13px", color: "#4A5568", marginBottom: "12px" }}>
          Review requests need at least one destination — Google, Yelp, or Facebook.
        </p>
        <a href="/settings" style={{
          fontSize: "13px", fontWeight: 700, color: "#080f22",
          backgroundColor: "#A8FF3E", padding: "8px 16px", borderRadius: "8px", textDecoration: "none",
        }}>
          Go to Settings →
        </a>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Channel selector */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8892A4", marginBottom: "8px" }}>
          Channel
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["sms", "email"] as const).map((ch) => (
            <button key={ch} type="button" onClick={() => setChannel(ch)}
              style={{
                flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer",
                fontSize: "14px", fontWeight: 600,
                backgroundColor: channel === ch ? "#0B1B3E" : "rgba(11,27,62,0.04)",
                border: channel === ch ? "1px solid #0B1B3E" : "1px solid rgba(11,27,62,0.1)",
                color: channel === ch ? "#A8FF3E" : "#4A5568",
              }}>
              {ch === "sms" ? "📱 SMS" : "✉️ Email"}
            </button>
          ))}
        </div>
        <input type="hidden" name="channel" value={channel} />
      </div>

      {/* Contact name */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
          Customer name <span style={{ color: "#8892A4", fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <input name="contact_name" type="text" placeholder="Jamie Rivera"
          style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.15)", fontSize: "14px", color: "#0B1B3E", outline: "none", fontFamily: "var(--font-sans)" }}
          onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
          onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      </div>

      {/* Phone or email */}
      {channel === "sms" ? (
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
            Phone number
          </label>
          <input name="phone" type="tel" required placeholder="+1 (555) 123-4567"
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.15)", fontSize: "14px", color: "#0B1B3E", outline: "none", fontFamily: "var(--font-sans)" }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      ) : (
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#0B1B3E", marginBottom: "6px" }}>
            Email address
          </label>
          <input name="email" type="email" required placeholder="jamie@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(11,27,62,0.15)", fontSize: "14px", color: "#0B1B3E", outline: "none", fontFamily: "var(--font-sans)" }}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
      )}

      {/* Status messages */}
      {state?.error && (
        <p style={{ fontSize: "13px", color: "#FF6450", margin: 0 }}>{state.error}</p>
      )}
      {state?.success && (
        <p style={{ fontSize: "13px", color: "#45A29E", margin: 0 }}>✓ {state.success}</p>
      )}

      <button type="submit" disabled={pending}
        style={{
          padding: "12px", borderRadius: "8px", border: "none",
          fontSize: "15px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
          backgroundColor: pending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
          color: "#080f22",
        }}>
        {pending ? "Sending…" : `Send ${channel === "sms" ? "SMS" : "email"} request`}
      </button>
    </form>
  );
}

// ─── Request history ──────────────────────────────────────────────────────────

function RequestHistory({ requests }: { requests: RecentRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "#FFFFFF", borderRadius: "12px",
      border: "1px solid rgba(11,27,62,0.07)", padding: "24px",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
        Recent requests
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {requests.map((r, i) => {
          const meta = STATUS_META[r.status] ?? { label: r.status, color: "#8892A4" };
          const contact = r.contact_name ?? r.contact_phone ?? r.contact_email ?? "Anonymous";
          const channelIcon = r.channel === "sms" ? "📱" : r.channel === "email" ? "✉️" : r.channel === "qr" ? "📷" : "🔗";

          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 0",
              borderBottom: i < requests.length - 1 ? "1px solid rgba(11,27,62,0.05)" : "none",
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{channelIcon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#0B1B3E", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {contact}
                </p>
                <p style={{ fontSize: "12px", color: "#8892A4", margin: 0 }}>
                  {formatAgo(r.sent_at ?? r.created_at)}
                </p>
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 600,
                color: meta.color,
                backgroundColor: `${meta.color}15`,
                padding: "2px 8px", borderRadius: "20px", flexShrink: 0,
              }}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GenerateClient({
  businessName,
  shareableUrl,
  hasAnyPlatform,
  recentRequests,
}: {
  businessName: string;
  shareableUrl: string;
  hasAnyPlatform: boolean;
  recentRequests: RecentRequest[];
  appUrl: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "6px" }}>
          Get Reviews
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>
          Send a review request to {businessName}&apos;s customers via SMS, email, QR code, or shareable link.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: send form */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Send request */}
          <div style={{
            backgroundColor: "#FFFFFF", borderRadius: "12px",
            border: "1px solid rgba(11,27,62,0.07)", padding: "24px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
              Send a request
            </p>
            <SendForm hasAnyPlatform={hasAnyPlatform} />
          </div>

          {/* Request history */}
          <RequestHistory requests={recentRequests} />
        </div>

        {/* Right: QR + shareable link */}
        <div className="flex flex-col gap-4">
          <QRCodeCard url={shareableUrl} />
          <ShareableLinkCard url={shareableUrl} />
        </div>
      </div>
    </div>
  );
}
