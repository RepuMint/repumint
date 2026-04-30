import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";

const STARTER_FEATURES = [
  "50 SMS review requests / mo",
  "500 email review requests / mo",
  "Google, Yelp & Facebook routing",
  "Sentiment filter — unhappy customers stay private",
  "Instant notifications on private feedback",
  "QR codes & shareable review links",
  "Respond to reviews from your dashboard",
];

const PRO_FEATURES = [
  "200 SMS review requests / mo",
  "2,000 email review requests / mo",
  "Everything in Starter",
  "AI-suggested review responses",
  "Advanced analytics & review growth tracking",
  "Priority support",
];

const FAQ = [
  {
    q: "Do I need a credit card to start the trial?",
    a: "No. Your 7-day free trial starts the moment you sign up — no payment info required. You'll only be asked for a card when you're ready to subscribe.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade from Starter to Pro (or downgrade) at any time. Changes take effect immediately and are prorated.",
  },
  {
    q: "What happens when I hit my SMS or email limit?",
    a: "We'll notify you when you're approaching your monthly limit. You can upgrade your plan mid-month or wait for the limit to reset on your next billing date.",
  },
  {
    q: "Which review platforms are supported?",
    a: "Google, Facebook, TripAdvisor, and Yelp are supported today. More platforms are on the roadmap.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No contracts, ever. Both plans are month-to-month and you can cancel any time from your billing settings.",
  },
];

function Check({ color = "#66FCF1" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", backgroundColor: "#F4F6FA" }}>
      <LandingNav active="pricing" />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(160deg, #080f22 0%, #0B1B3E 60%, #0d2240 100%)",
        paddingTop: "144px",
        paddingBottom: "80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(168,255,62,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(168,255,62,0.1)",
            border: "1px solid rgba(168,255,62,0.25)",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#A8FF3E",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}>
            <span>✦</span>
            7-day free trial · No credit card required
          </div>
          <h1 style={{
            fontSize: "clamp(34px, 5vw, 54px)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            marginBottom: "20px",
          }}>
            Simple, transparent pricing
          </h1>
          <p style={{
            fontSize: "clamp(16px, 1.8vw, 19px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.6,
          }}>
            One plan for growing businesses, one for scaling them. Both include everything you need to build a stronger reputation.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section style={{ padding: "80px 24px", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
          alignItems: "stretch",
        }}>
          {/* Starter */}
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "40px",
            border: "1px solid rgba(11,27,62,0.08)",
            boxShadow: "0 2px 16px rgba(11,27,62,0.06)",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(11,27,62,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                Starter
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.03em" }}>$29</span>
                <span style={{ fontSize: "15px", color: "rgba(11,27,62,0.45)", fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(11,27,62,0.55)", lineHeight: 1.6 }}>
                Perfect for local businesses just getting started with reputation management.
              </p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
              {STARTER_FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "#0B1B3E" }}>
                  <Check color="#45A29E" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{
              display: "block",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#0B1B3E",
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: "10px",
              border: "2px solid #0B1B3E",
              transition: "background 120ms ease, color 120ms ease",
            }}>
              Start free trial
            </Link>
          </div>

          {/* Pro */}
          <div style={{
            background: "linear-gradient(160deg, #080f22 0%, #0B1B3E 100%)",
            borderRadius: "20px",
            padding: "40px",
            border: "1px solid rgba(102,252,241,0.15)",
            boxShadow: "0 8px 48px rgba(102,252,241,0.12)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(168,255,62,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#080f22",
              letterSpacing: "0.06em",
            }}>
              MOST POPULAR
            </div>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                Pro
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em" }}>$39</span>
                <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/month</span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                For businesses serious about growth with AI responses and advanced analytics.
              </p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: "14px", flexGrow: 1 }}>
              {PRO_FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
                  <Check color="#A8FF3E" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="btn-gradient" style={{
              display: "block",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#080f22",
              textDecoration: "none",
              padding: "14px 24px",
              borderRadius: "10px",
            }}>
              Start free trial →
            </Link>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(11,27,62,0.4)", marginTop: "28px" }}>
          Both plans include a 7-day free trial. Cancel any time. No contracts.
        </p>
      </section>

      {/* Feature comparison row */}
      <section style={{ padding: "0 24px 96px", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid rgba(11,27,62,0.07)",
          overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 120px",
            background: "#0B1B3E",
            padding: "16px 28px",
            gap: "16px",
            alignItems: "center",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>Starter</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#A8FF3E", textAlign: "center" }}>Pro</div>
          </div>
          {[
            { feature: "SMS review requests / mo", starter: "50", pro: "200" },
            { feature: "Email review requests / mo", starter: "500", pro: "2,000" },
            { feature: "Review platform connections", starter: "✓", pro: "✓" },
            { feature: "Sentiment filter", starter: "✓", pro: "✓" },
            { feature: "Private feedback forms", starter: "✓", pro: "✓" },
            { feature: "QR codes & review links", starter: "✓", pro: "✓" },
            { feature: "Dashboard review responses", starter: "✓", pro: "✓" },
            { feature: "AI-suggested responses", starter: "—", pro: "✓" },
            { feature: "Advanced analytics", starter: "—", pro: "✓" },
            { feature: "Priority support", starter: "—", pro: "✓" },
          ].map((row, i) => (
            <div key={row.feature} style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px",
              padding: "14px 28px",
              gap: "16px",
              alignItems: "center",
              borderTop: i === 0 ? "none" : "1px solid rgba(11,27,62,0.06)",
              background: i % 2 === 0 ? "#ffffff" : "#fafbfd",
            }}>
              <div style={{ fontSize: "14px", color: "#0B1B3E" }}>{row.feature}</div>
              <div style={{ fontSize: "14px", color: row.starter === "—" ? "rgba(11,27,62,0.25)" : "#45A29E", fontWeight: 600, textAlign: "center" }}>{row.starter}</div>
              <div style={{ fontSize: "14px", color: row.pro === "✓" || row.pro !== "—" ? "#6BBF1A" : "rgba(11,27,62,0.25)", fontWeight: 600, textAlign: "center" }}>{row.pro}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        background: "#0B1B3E",
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "48px", textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                padding: "24px 28px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>{item.q}</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(160deg, #080f22 0%, #0B1B3E 100%)",
        padding: "96px 24px",
        textAlign: "center",
        borderTop: "1px solid rgba(102,252,241,0.06)",
      }}>
        <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Start your free trial today
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>
          7 days free. No credit card. Up and running in 15 minutes.
        </p>
        <Link href="/signup" className="btn-gradient" style={{
          display: "inline-block",
          fontSize: "16px",
          fontWeight: 700,
          color: "#080f22",
          textDecoration: "none",
          padding: "16px 40px",
          borderRadius: "10px",
          boxShadow: "0 0 48px rgba(102,252,241,0.2)",
        }}>
          Get started free →
        </Link>
      </section>
    </div>
  );
}
