import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing";
import { PLANS } from "@/lib/stripe";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Billing & Plan" };

function daysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(168,255,62,0.15)"/>
      <path d="M4.5 7.5l2 2 4-4" stroke="#A8FF3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  const color = pct > 85 ? "#FF6450" : pct > 60 ? "#F59E0B" : "#66FCF1";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: "#4A5568" }}>{label}</span>
        <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "#0B1B3E", fontWeight: 600 }}>
          {used}<span style={{ color: "#8892A4", fontWeight: 400 }}>/{limit}</span>
        </span>
      </div>
      <div style={{ height: "5px", backgroundColor: "rgba(11,27,62,0.07)", borderRadius: "3px" }}>
        <div style={{
          height: "5px", width: `${pct}%`, borderRadius: "3px",
          backgroundColor: color, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_ends_at, stripe_customer_id, current_period_end, cancel_at_period_end, sms_used_this_month, email_used_this_month, monthly_sms_limit, monthly_email_limit")
    .eq("business_id", business.id)
    .maybeSingle();

  const isActivePaid = sub?.status === "active" && (sub?.plan === "starter" || sub?.plan === "pro");
  const days = daysLeft(sub?.trial_ends_at ?? null);
  const trialExpired = sub?.plan === "trial" && days !== null && days === 0;

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Flash messages */}
      {params.success && (
        <div style={{
          marginBottom: "28px", padding: "16px 20px", borderRadius: "12px",
          backgroundColor: "rgba(168,255,62,0.09)", border: "1px solid rgba(168,255,62,0.3)",
        }}>
          <p style={{ fontWeight: 700, color: "#0B1B3E", marginBottom: "2px" }}>You&apos;re all set 🎉</p>
          <p style={{ fontSize: "14px", color: "#4A5568" }}>Your plan is active. All features are unlocked.</p>
        </div>
      )}
      {params.canceled && (
        <div style={{
          marginBottom: "28px", padding: "14px 18px", borderRadius: "12px",
          backgroundColor: "rgba(11,27,62,0.04)", border: "1px solid rgba(11,27,62,0.08)",
          fontSize: "14px", color: "#4A5568",
        }}>
          No changes were made.
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-1px", color: "#0B1B3E", marginBottom: "6px" }}>
          Billing & Plan
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4" }}>
          {isActivePaid
            ? "You're on an active paid plan."
            : trialExpired
            ? "Your free trial has ended. Choose a plan to continue."
            : `${days} day${days !== 1 ? "s" : ""} remaining in your free trial.`}
        </p>
      </div>

      {/* Current plan card */}
      {sub && (
        <div style={{
          backgroundColor: "#FFFFFF", borderRadius: "12px",
          border: "1px solid rgba(11,27,62,0.08)", padding: "24px",
          marginBottom: "32px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: isActivePaid ? "24px" : "0" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8892A4", marginBottom: "6px" }}>
                Current plan
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.5px", textTransform: "capitalize" }}>
                  {sub.plan === "trial" ? "Free Trial" : sub.plan}
                </span>
                {sub.plan === "trial" && days !== null && days > 0 && (
                  <span style={{
                    fontSize: "12px", fontWeight: 700, color: "#A8FF3E",
                    backgroundColor: "rgba(168,255,62,0.12)",
                    padding: "3px 10px", borderRadius: "20px",
                  }}>
                    {days} days left
                  </span>
                )}
                {isActivePaid && (
                  <span style={{
                    fontSize: "12px", fontWeight: 700, color: "#66FCF1",
                    backgroundColor: "rgba(102,252,241,0.1)",
                    padding: "3px 10px", borderRadius: "20px",
                  }}>
                    Active
                  </span>
                )}
                {sub.cancel_at_period_end && (
                  <span style={{ fontSize: "13px", color: "#FF6450", fontWeight: 500 }}>
                    · Cancels {new Date(sub.current_period_end ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>

            {isActivePaid && (
              <form action={createPortalSession}>
                <button type="submit" style={{
                  fontSize: "13px", fontWeight: 600, color: "#0B1B3E",
                  backgroundColor: "#FFFFFF", border: "1px solid rgba(11,27,62,0.2)",
                  padding: "9px 16px", borderRadius: "8px", cursor: "pointer",
                }}>
                  Manage billing →
                </button>
              </form>
            )}
          </div>

          {isActivePaid && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ height: "1px", backgroundColor: "rgba(11,27,62,0.06)", margin: "0 -24px" }} />
              <UsageMeter label="SMS requests this month" used={sub.sms_used_this_month} limit={sub.monthly_sms_limit} />
              <UsageMeter label="Email requests this month" used={sub.email_used_this_month} limit={sub.monthly_email_limit} />
            </div>
          )}
        </div>
      )}

      {/* Plan selection */}
      {!isActivePaid && (
        <>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#8892A4", marginBottom: "16px" }}>
            Choose a plan
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {(["starter", "pro"] as const).map((key) => {
              const plan = PLANS[key];
              const isPro = key === "pro";

              return (
                <div key={key} style={{
                  backgroundColor: "#FFFFFF", borderRadius: "14px",
                  border: isPro ? "2px solid rgba(168,255,62,0.35)" : "1px solid rgba(11,27,62,0.08)",
                  padding: "28px 24px",
                  position: "relative", display: "flex", flexDirection: "column",
                }}>
                  {isPro && (
                    <div style={{
                      position: "absolute", top: "-1px", right: "22px",
                      backgroundColor: "#A8FF3E", color: "#080f22",
                      fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "4px 10px", borderRadius: "0 0 8px 8px",
                    }}>
                      Best value
                    </div>
                  )}

                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8892A4", marginBottom: "8px" }}>
                      {plan.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontSize: "40px", fontWeight: 800, letterSpacing: "-2px", color: "#0B1B3E", lineHeight: 1 }}>
                        ${plan.amount / 100}
                      </span>
                      <span style={{ fontSize: "14px", color: "#8892A4" }}>/mo</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "4px" }}>Billed monthly</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginBottom: "24px" }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <Check />
                        <span style={{ fontSize: "13px", color: "#4A5568", lineHeight: "1.5" }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <form action={createCheckoutSession.bind(null, key)}>
                    <button type="submit" className="btn-primary w-full rounded-lg py-3 text-[14px]">
                      Get {plan.name}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: "12px", color: "#8892A4", marginTop: "16px", textAlign: "center" }}>
            Cancel anytime · No hidden fees
          </p>
        </>
      )}
    </div>
  );
}
