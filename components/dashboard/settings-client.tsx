"use client";

import { useActionState, useState, useTransition } from "react";
import {
  saveBusinessInfo,
  saveSentimentConfig,
  saveTripadvisorConnection,
  saveYelpUrl,
  disconnectPlatform,
  type SettingsState,
} from "@/app/actions/settings";
import { LogoUpload } from "@/components/dashboard/logo-upload";

// ─── Shared styles ────────────────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: "100%", borderRadius: "8px", padding: "10px 14px",
  fontSize: "14px", color: "#0B1B3E", outline: "none",
  border: "1px solid rgba(11,27,62,0.15)", backgroundColor: "#FFFFFF",
  fontFamily: "var(--font-sans)",
};

const label: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  color: "#0B1B3E", marginBottom: "6px",
};

const section: React.CSSProperties = {
  backgroundColor: "#FFFFFF", borderRadius: "12px",
  border: "1px solid rgba(11,27,62,0.07)", padding: "28px",
  marginBottom: "16px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "16px", fontWeight: 700, color: "#0B1B3E",
  marginBottom: "4px",
};

const sectionSub: React.CSSProperties = {
  fontSize: "13px", color: "#8892A4", marginBottom: "24px",
};

function SaveButton({ pending, label: lbl = "Save changes" }: { pending: boolean; label?: string }) {
  return (
    <button type="submit" disabled={pending} style={{
      fontSize: "13px", fontWeight: 700,
      color: "#080f22",
      backgroundColor: pending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
      padding: "9px 20px", borderRadius: "8px", border: "none",
      cursor: pending ? "not-allowed" : "pointer",
      marginTop: "20px",
    }}>
      {pending ? "Saving…" : lbl}
    </button>
  );
}

function Flash({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{
      padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontSize: "14px",
      backgroundColor: type === "success" ? "rgba(102,252,241,0.08)" : "rgba(255,100,80,0.06)",
      border: `1px solid ${type === "success" ? "rgba(102,252,241,0.25)" : "rgba(255,100,80,0.2)"}`,
      color: type === "success" ? "#45A29E" : "#FF6450",
    }}>
      {msg}
    </div>
  );
}

function StateFlash({ state }: { state: SettingsState }) {
  if (!state?.success && !state?.error) return null;
  return <Flash msg={state.success ?? state.error ?? ""} type={state.success ? "success" : "error"} />;
}

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)";
  e.currentTarget.style.boxShadow = "none";
}

// ─── Business info section ────────────────────────────────────────────────────

function BusinessInfoSection({ business }: { business: Record<string, unknown> }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveBusinessInfo, null);

  return (
    <div style={section}>
      <p style={sectionTitle}>Business info</p>
      <p style={sectionSub}>Shown on review requests and your shareable link page.</p>
      <StateFlash state={state} />

      <form action={action}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label style={label}>Business name</label>
            <input name="name" defaultValue={business.name as string} style={input} required onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={label}>Phone</label>
            <input name="phone" type="tel" defaultValue={(business.phone as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={label}>Email</label>
            <input name="email" type="email" defaultValue={(business.email as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="sm:col-span-2">
            <label style={label}>Website</label>
            <input name="website" type="url" placeholder="https://" defaultValue={(business.website as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="sm:col-span-2">
            <label style={label}>Street address</label>
            <input name="address" defaultValue={(business.address as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={label}>City</label>
            <input name="city" defaultValue={(business.city as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={label}>State</label>
              <input name="state" maxLength={2} defaultValue={(business.state as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={label}>ZIP</label>
              <input name="zip" defaultValue={(business.zip as string) ?? ""} style={input} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </div>
        <SaveButton pending={pending} />
      </form>
    </div>
  );
}

// ─── Platform connection card ─────────────────────────────────────────────────

function PlatformCard({
  name, color, connected, connectedSince, children, connectHref, onDisconnect,
}: {
  name: string; color: string; connected: boolean;
  connectedSince?: string | null;
  children?: React.ReactNode;
  connectHref?: string;
  onDisconnect?: () => void;
}) {
  return (
    <div style={{
      border: `1px solid ${connected ? `${color}30` : "rgba(11,27,62,0.07)"}`,
      borderRadius: "10px", padding: "20px",
      backgroundColor: connected ? `${color}06` : "#FAFBFD",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: children ? "16px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            backgroundColor: connected ? "#66FCF1" : "rgba(11,27,62,0.2)",
          }} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E" }}>{name}</span>
          {connected && connectedSince && (
            <span style={{ fontSize: "11px", color: "#45A29E" }}>Connected</span>
          )}
        </div>

        {connected ? (
          <button onClick={onDisconnect} style={{
            fontSize: "12px", color: "#FF6450",
            backgroundColor: "rgba(255,100,80,0.07)", border: "1px solid rgba(255,100,80,0.2)",
            padding: "5px 12px", borderRadius: "7px", cursor: "pointer",
          }}>
            Disconnect
          </button>
        ) : connectHref ? (
          <a href={connectHref} style={{
            fontSize: "12px", fontWeight: 700, color: "#080f22",
            backgroundColor: "#A8FF3E", padding: "6px 14px", borderRadius: "7px", textDecoration: "none",
          }}>
            Connect →
          </a>
        ) : null}
      </div>

      {children}
    </div>
  );
}

// ─── Platforms section ────────────────────────────────────────────────────────

function PlatformsSection({
  business, appUrl,
}: {
  business: Record<string, unknown>;
  appUrl: string;
}) {
  const [taState, taAction, taPending] = useActionState<SettingsState, FormData>(saveTripadvisorConnection, null);
  const [yelpState, yelpAction, yelpPending] = useActionState<SettingsState, FormData>(saveYelpUrl, null);
  const [disconnecting, startDisconnect] = useTransition();

  function handleDisconnect(platform: "google" | "facebook") {
    startDisconnect(async () => { await disconnectPlatform(platform); });
  }

  const googleConnected = !!business.google_access_token;
  const fbConnected = !!business.facebook_access_token;
  const taConnected = !!business.tripadvisor_location_id;

  return (
    <div style={section}>
      <p style={sectionTitle}>Review platforms</p>
      <p style={sectionSub}>
        Happy customers are sent to these platforms to leave a public review.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Google */}
        <PlatformCard
          name="Google Business"
          color="#4285F4"
          connected={googleConnected}
          connectHref={`${appUrl}/api/connect/google`}
          onDisconnect={() => handleDisconnect("google")}
        >
          {googleConnected && (
            <p style={{ fontSize: "12px", color: "#8892A4" }}>
              Place ID: {(business.google_place_id as string) ?? "Not set — add it below for review links."}
            </p>
          )}
        </PlatformCard>

        {/* Yelp */}
        <PlatformCard name="Yelp" color="#FF1A1A" connected={!!(business.yelp_url)}>
          <StateFlash state={yelpState} />
          <form action={yelpAction}>
            <label style={{ ...label, marginBottom: "6px" }}>Yelp listing URL</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                name="yelp_url" type="url"
                placeholder="https://www.yelp.com/biz/your-business"
                defaultValue={(business.yelp_url as string) ?? ""}
                style={{ ...input, flex: 1 }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button type="submit" disabled={yelpPending} style={{
                fontSize: "13px", fontWeight: 700, color: "#080f22",
                backgroundColor: yelpPending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
                padding: "0 16px", borderRadius: "8px", border: "none", cursor: yelpPending ? "not-allowed" : "pointer", flexShrink: 0,
              }}>
                {yelpPending ? "Saving…" : "Save"}
              </button>
            </div>
            <p style={{ fontSize: "11px", color: "#8892A4", marginTop: "5px" }}>
              Happy customers will be sent here. Reviews aren't synced into the dashboard (Yelp API restriction).
            </p>
          </form>
        </PlatformCard>

        {/* Facebook */}
        <PlatformCard
          name="Facebook"
          color="#1877F2"
          connected={fbConnected}
          connectHref={`${appUrl}/api/connect/facebook`}
          onDisconnect={() => handleDisconnect("facebook")}
        >
          {fbConnected && business.facebook_page_id ? (
            <p style={{ fontSize: "12px", color: "#8892A4" }}>
              Page ID: {String(business.facebook_page_id)}
            </p>
          ) : null}
        </PlatformCard>

        {/* TripAdvisor */}
        <PlatformCard name="TripAdvisor" color="#00aa6c" connected={taConnected}>
          <StateFlash state={taState} />
          <form action={taAction}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label style={{ ...label, marginBottom: "5px" }}>Location ID</label>
                <input name="tripadvisor_location_id" placeholder="1234567"
                  defaultValue={(business.tripadvisor_location_id as string) ?? ""}
                  style={input} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
              <div>
                <label style={{ ...label, marginBottom: "5px" }}>API key</label>
                <input name="tripadvisor_api_key" placeholder="From tripadvisor.com/developers"
                  defaultValue={(business.tripadvisor_api_key as string) ?? ""}
                  style={input} onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>
            <button type="submit" disabled={taPending} style={{
              fontSize: "13px", fontWeight: 700, color: "#080f22",
              backgroundColor: taPending ? "rgba(168,255,62,0.4)" : "#A8FF3E",
              padding: "7px 16px", borderRadius: "8px", border: "none",
              cursor: taPending ? "not-allowed" : "pointer", marginTop: "10px",
            }}>
              {taPending ? "Saving…" : "Save"}
            </button>
          </form>
        </PlatformCard>
      </div>
      {disconnecting && <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "10px" }}>Disconnecting…</p>}
    </div>
  );
}

// ─── Sentiment filter section ─────────────────────────────────────────────────

function SentimentSection({ business }: { business: Record<string, unknown> }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSentimentConfig, null);
  const [enabled, setEnabled] = useState((business.sentiment_filter_enabled as boolean) ?? true);
  const [threshold, setThreshold] = useState((business.sentiment_threshold as number) ?? 4);

  return (
    <div style={section}>
      <p style={sectionTitle}>Sentiment filter</p>
      <p style={sectionSub}>
        Customers who rate below your threshold are sent to a private form instead of a public platform.
        You're notified immediately every time.
      </p>
      <StateFlash state={state} />

      <form action={action}>
        <input type="hidden" name="sentiment_filter_enabled" value={enabled.toString()} />
        <input type="hidden" name="sentiment_threshold" value={threshold.toString()} />

        {/* Enable toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E" }}>Enable sentiment filter</p>
            <p style={{ fontSize: "13px", color: "#8892A4", marginTop: "2px" }}>
              {enabled ? "Active — unhappy customers go private" : "Disabled — all customers go to review platforms"}
            </p>
          </div>
          <button type="button" onClick={() => setEnabled(!enabled)}
            style={{
              width: "48px", height: "28px", borderRadius: "14px", cursor: "pointer", border: "none",
              backgroundColor: enabled ? "#A8FF3E" : "rgba(11,27,62,0.15)",
              position: "relative", transition: "background-color 120ms ease", flexShrink: 0,
            }}
          >
            <div style={{
              position: "absolute", top: "4px",
              left: enabled ? "calc(100% - 22px)" : "4px",
              width: "20px", height: "20px", borderRadius: "50%",
              backgroundColor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              transition: "left 120ms ease",
            }} />
          </button>
        </div>

        {/* Threshold */}
        {enabled && (
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#0B1B3E", marginBottom: "4px" }}>
              Private feedback below
            </p>
            <p style={{ fontSize: "13px", color: "#8892A4", marginBottom: "14px" }}>
              Customers rating {threshold} star{threshold !== 1 ? "s" : ""} or below go to your private form.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setThreshold(star)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: "8px", cursor: "pointer",
                    fontSize: "14px", fontWeight: 600,
                    backgroundColor: threshold === star ? "#0B1B3E" : "rgba(11,27,62,0.04)",
                    border: threshold === star ? "1px solid #0B1B3E" : "1px solid rgba(11,27,62,0.1)",
                    color: threshold === star ? "#A8FF3E" : "#0B1B3E",
                  }}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>
        )}

        <SaveButton pending={pending} />
      </form>
    </div>
  );
}

// ─── Account section ──────────────────────────────────────────────────────────

function AccountSection({ email }: { email: string }) {
  return (
    <div style={section}>
      <p style={sectionTitle}>Account</p>
      <p style={sectionSub}>Your login email and account details.</p>

      <div>
        <label style={label}>Email</label>
        <input value={email} disabled style={{ ...input, backgroundColor: "#F4F6FA", color: "#8892A4", cursor: "not-allowed" }} />
        <p style={{ fontSize: "11px", color: "#8892A4", marginTop: "5px" }}>
          To change your email, contact support.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsClient({
  business, userId, ownerEmail, appUrl, flash, flashType,
}: {
  business: Record<string, unknown>;
  userId: string;
  ownerEmail: string;
  appUrl: string;
  flash: string | null;
  flashType: "success" | "error" | null;
}) {
  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "6px" }}>
          Settings
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>
          Manage your platforms, sentiment filter, and business info.
        </p>
      </div>

      {flash && flashType && <Flash msg={flash} type={flashType} />}

      {/* Logo */}
      <div style={section}>
        <p style={sectionTitle}>Business logo</p>
        <p style={sectionSub}>
          Shown on SMS links, email requests, and the customer review page.
          PNG with a transparent background works best.
        </p>
        <LogoUpload
          currentLogoUrl={(business.logo_url as string) ?? null}
          userId={userId}
        />
      </div>

      <BusinessInfoSection business={business} />
      <PlatformsSection business={business} appUrl={appUrl} />
      <SentimentSection business={business} />
      <AccountSection email={ownerEmail} />
    </div>
  );
}
