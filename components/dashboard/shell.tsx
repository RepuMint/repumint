"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/database";
import type { BusinessSummary } from "@/app/(dashboard)/layout";
import { setActiveBusiness } from "@/app/actions/business-switch";
import { logout } from "@/app/actions/auth";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  {
    label: "Reviews",
    href: "/dashboard",
    accent: "#66FCF1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    label: "Get Reviews",
    href: "/generate",
    accent: "#A8FF3E",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    label: "Feedback",
    href: "/feedback",
    accent: "#F59E0B",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    accent: "#66FCF1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    accent: "#66FCF1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
] as const;

// ─── Trial pill ───────────────────────────────────────────────────────────────

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function PlanPill({ plan, status, trialEndsAt }: {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
}) {
  const days = plan === "trial" ? trialDaysLeft(trialEndsAt) : null;
  const isExpired = days !== null && days === 0;

  if ((plan === "starter" || plan === "pro") && status === "active") {
    const color = plan === "pro" ? "#A8FF3E" : "#66FCF1";
    return (
      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color, backgroundColor: `${color}20`, padding: "3px 10px", borderRadius: "20px" }}>
        {plan}
      </span>
    );
  }
  if (isExpired) {
    return (
      <Link href="/billing" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF6450", backgroundColor: "rgba(255,100,80,0.12)", padding: "3px 10px", borderRadius: "20px" }}>
          Trial expired
        </span>
      </Link>
    );
  }
  return (
    <Link href="/billing" style={{ textDecoration: "none" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "#A8FF3E", backgroundColor: "rgba(168,255,62,0.12)", padding: "3px 10px", borderRadius: "20px" }}>
        {days}d trial
      </span>
    </Link>
  );
}

// ─── Business switcher dropdown ───────────────────────────────────────────────

function BusinessSwitcher({
  active,
  all,
}: {
  active: BusinessSummary;
  all: BusinessSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [switching, startSwitch] = useTransition();
  const [loggingOut, startLogout] = useTransition();

  function handleSwitch(id: string) {
    if (id === active.id) { setOpen(false); return; }
    setOpen(false);
    startSwitch(async () => { await setActiveBusiness(id); });
  }

  function handleLogout() {
    setOpen(false);
    startLogout(async () => { await logout(); });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        disabled={switching || loggingOut}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "5px 10px 5px 8px",
          backgroundColor: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
          cursor: "pointer", transition: "all 120ms ease",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          backgroundColor: "rgba(102,252,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700, color: "#66FCF1", flexShrink: 0,
        }}>
          {active.name[0]?.toUpperCase() ?? "?"}
        </div>
        <span style={{
          fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.8)",
          maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {switching ? "Switching…" : loggingOut ? "Signing out…" : active.name}
        </span>
        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 120ms ease", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
            minWidth: "220px",
            backgroundColor: "#0B1B3E",
            border: "1px solid rgba(102,252,241,0.12)",
            borderRadius: "12px",
            boxShadow: "0 16px 48px rgba(8,15,34,0.5)",
            overflow: "hidden",
          }}>
            {/* Business list */}
            <div style={{ padding: "8px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "4px 8px 6px" }}>
                Your businesses
              </p>
              {all.filter(b => b.onboarding_completed).map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSwitch(b.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "9px 10px", borderRadius: "8px",
                    background: "none", border: "none", cursor: "pointer",
                    textAlign: "left", transition: "background 120ms ease",
                    backgroundColor: b.id === active.id ? "rgba(102,252,241,0.1)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (b.id !== active.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { if (b.id !== active.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                >
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                    backgroundColor: b.id === active.id ? "rgba(102,252,241,0.2)" : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700,
                    color: b.id === active.id ? "#66FCF1" : "rgba(255,255,255,0.6)",
                  }}>
                    {b.name[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: b.id === active.id ? 600 : 400, color: b.id === active.id ? "#FFFFFF" : "rgba(255,255,255,0.65)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.name}
                  </span>
                  {b.id === active.id && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#66FCF1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.07)", margin: "0 8px" }} />

            {/* Add another business */}
            <div style={{ padding: "8px" }}>
              <Link
                href="/onboarding?addBusiness=true"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "9px 10px", borderRadius: "8px",
                  textDecoration: "none", color: "rgba(255,255,255,0.6)",
                  fontSize: "13px", transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)"; }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "rgba(168,255,62,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A8FF3E" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <div>
                  <span style={{ display: "block", fontWeight: 500 }}>Add another business</span>
                  <span style={{ display: "block", fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>+$15/mo per additional location</span>
                </div>
              </Link>

              {/* Sign out */}
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "9px 10px", borderRadius: "8px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,100,80,0.7)", fontSize: "13px",
                  textAlign: "left", transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,100,80,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#FF6450"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,100,80,0.7)"; }}
              >
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "rgba(255,100,80,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function DashboardShell({
  activeBusiness,
  allBusinesses,
  plan,
  status,
  trialEndsAt,
  children,
}: {
  activeBusiness: BusinessSummary;
  allBusinesses: BusinessSummary[];
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, startLogout] = useTransition();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F6FA", fontFamily: "var(--font-sans)" }}>

      {/* ── Top navigation bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50, height: "88px",
        backgroundColor: "#0B1B3E",
        display: "flex", alignItems: "center", paddingInline: "24px",
        borderBottom: "1px solid rgba(102,252,241,0.08)",
        boxShadow: "0 2px 20px rgba(8,15,34,0.3)",
      }}>
        {/* Logo — bigger */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", flexShrink: 0, marginRight: "28px", textDecoration: "none" }}>
          <img src="/repumint-logo.png" alt="RepuMint" style={{ height: "108px", width: "auto" }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex" style={{ flex: 1, alignItems: "center", gap: "2px" }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "8px 13px", borderRadius: "8px", textDecoration: "none",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? item.accent : "rgba(255,255,255,0.5)",
                  backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                  position: "relative", transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.05)"; } }}
                onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; } }}
              >
                <span style={{ color: isActive ? item.accent : "currentColor", opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <span style={{ position: "absolute", bottom: "-1px", left: "13px", right: "13px", height: "2px", backgroundColor: item.accent, borderRadius: "2px 2px 0 0" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: plan pill + business switcher */}
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: "12px", flexShrink: 0, marginLeft: "auto" }}>
          <PlanPill plan={plan} status={status} trialEndsAt={trialEndsAt} />
          <BusinessSwitcher active={activeBusiness} all={allBusinesses} />
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileMenuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </header>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden" style={{
          position: "fixed", top: "88px", left: 0, right: 0, zIndex: 40,
          backgroundColor: "#0B1B3E", borderBottom: "1px solid rgba(102,252,241,0.08)",
          padding: "8px 16px 16px", boxShadow: "0 8px 24px rgba(8,15,34,0.4)",
        }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "8px", marginBottom: "2px",
                textDecoration: "none", fontSize: "15px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? item.accent : "rgba(255,255,255,0.65)",
                backgroundColor: isActive ? "rgba(255,255,255,0.07)" : "transparent",
              }}>
                <span style={{ color: isActive ? item.accent : "currentColor" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{activeBusiness.name}</span>
            <button
              onClick={() => { setMobileMenuOpen(false); startLogout(async () => { await logout(); }); }}
              style={{ fontSize: "13px", color: "rgba(255,100,80,0.7)", background: "none", border: "none", cursor: "pointer" }}
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}

      {/* Page content */}
      <main style={{ padding: "36px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
