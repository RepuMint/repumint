import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";

const FEATURES = [
  {
    icon: "⭐",
    title: "Smart review routing",
    body: "Happy customers are guided straight to Google, Yelp, or Facebook. Unhappy ones land on a private feedback form — so negative reviews stay off the internet.",
    accent: "#66FCF1",
  },
  {
    icon: "📱",
    title: "SMS & email outreach",
    body: "Send review requests by text or email in seconds. Personalize with the customer's name and your branding — all managed from one place.",
    accent: "#A8FF3E",
  },
  {
    icon: "🔗",
    title: "Multi-platform support",
    body: "Connect Google, Facebook, TripAdvisor, and Yelp. All your reviews land in a single dashboard so nothing falls through the cracks.",
    accent: "#66FCF1",
  },
  {
    icon: "💬",
    title: "Respond from your dashboard",
    body: "Read and respond to every review without leaving RepuMint. Pro plan users get AI-suggested replies to save even more time.",
    accent: "#A8FF3E",
  },
  {
    icon: "📊",
    title: "Analytics & growth tracking",
    body: "See your average rating over time, review volume by platform, and how your reputation is trending — all in easy-to-read charts.",
    accent: "#66FCF1",
  },
  {
    icon: "🔔",
    title: "Instant feedback alerts",
    body: "When a customer leaves private negative feedback, you get notified immediately so you can reach out and make it right before it becomes a public review.",
    accent: "#A8FF3E",
  },
];

const STEPS = [
  { n: "01", title: "Connect your platforms", body: "Link your Google, Facebook, TripAdvisor, or Yelp profiles in under a minute." },
  { n: "02", title: "Add your customers", body: "Upload a contact list, add individuals, or let your team build it as you go." },
  { n: "03", title: "Send review requests", body: "Fire off personalized SMS or email requests with a single click — or set up automated campaigns." },
  { n: "04", title: "Route by sentiment", body: "Satisfied customers are taken directly to your review page. Unhappy customers get a private form." },
  { n: "05", title: "Track & respond", body: "Watch your ratings climb. Respond to every review from your dashboard and close the feedback loop." },
];

export default function ProductPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", backgroundColor: "#F4F6FA" }}>
      <LandingNav active="product" />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(160deg, #080f22 0%, #0B1B3E 60%, #0d2240 100%)",
        paddingTop: "144px",
        paddingBottom: "96px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(102,252,241,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(102,252,241,0.1)",
            border: "1px solid rgba(102,252,241,0.25)",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#66FCF1",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}>
            The complete reputation platform
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 58px)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}>
            Your reputation,<br />
            <span style={{ background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              on autopilot
            </span>
          </h1>
          <p style={{
            fontSize: "clamp(17px, 1.8vw, 20px)",
            color: "rgba(255,255,255,0.62)",
            lineHeight: 1.65,
            marginBottom: "48px",
            maxWidth: "560px",
            margin: "0 auto 48px",
          }}>
            RepuMint automatically collects reviews from happy customers, routes unhappy ones to private feedback, and gives you everything you need to manage your online reputation in one place.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" className="btn-gradient" style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#080f22",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              display: "inline-block",
              boxShadow: "0 0 40px rgba(102,252,241,0.18)",
            }}>
              Start free trial →
            </Link>
            <Link href="/pricing" style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
              padding: "14px 32px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "inline-block",
              transition: "border-color 120ms ease",
            }}>
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: "96px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Everything you need, nothing you don't
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(11,27,62,0.55)", maxWidth: "480px", margin: "0 auto" }}>
            RepuMint is purpose-built for local businesses who want more reviews without the hassle.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              border: "1px solid rgba(11,27,62,0.07)",
              boxShadow: "0 2px 12px rgba(11,27,62,0.05)",
              transition: "box-shadow 160ms ease, transform 160ms ease",
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: f.accent === "#66FCF1" ? "rgba(102,252,241,0.12)" : "rgba(168,255,62,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                marginBottom: "20px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0B1B3E", marginBottom: "10px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(11,27,62,0.6)", lineHeight: 1.65 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        background: "#0B1B3E",
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              Up and running in 15 minutes
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)" }}>
              No complicated setup. No developer needed. Just results.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{
                display: "flex",
                gap: "28px",
                alignItems: "flex-start",
                padding: "28px 32px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.04em",
                  minWidth: "28px",
                  paddingTop: "2px",
                }}>
                  {step.n}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>{step.title}</div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sentiment routing callout */}
      <section style={{ padding: "96px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{
          background: "linear-gradient(135deg, #080f22 0%, #0B1B3E 100%)",
          borderRadius: "24px",
          padding: "clamp(40px, 5vw, 72px)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "center",
          border: "1px solid rgba(102,252,241,0.1)",
        }}>
          <div>
            <div style={{
              display: "inline-block",
              background: "rgba(102,252,241,0.1)",
              border: "1px solid rgba(102,252,241,0.2)",
              borderRadius: "999px",
              padding: "5px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#66FCF1",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}>
              Sentiment filter
            </div>
            <h3 style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.2, marginBottom: "16px" }}>
              Stop negative reviews before they go public
            </h3>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: "28px" }}>
              When you send a review request, customers first rate their experience. Satisfied customers are taken straight to your review page. Unsatisfied customers land on a private feedback form — only you see it.
            </p>
            <Link href="/signup" className="btn-gradient" style={{
              display: "inline-block",
              fontSize: "14px",
              fontWeight: 700,
              color: "#080f22",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: "8px",
            }}>
              Try it free
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { emoji: "😊", label: "Happy customer", outcome: "→ Taken to Google / Yelp / Facebook", color: "#A8FF3E", bg: "rgba(168,255,62,0.08)" },
              { emoji: "😐", label: "Unhappy customer", outcome: "→ Private feedback form (only you see it)", color: "#FF6450", bg: "rgba(255,100,80,0.08)" },
            ].map((row) => (
              <div key={row.label} style={{
                background: row.bg,
                border: `1px solid ${row.color}22`,
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "28px" }}>{row.emoji}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>{row.label}</div>
                  <div style={{ fontSize: "13px", color: row.color }}>{row.outcome}</div>
                </div>
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
      }}>
        <h2 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
          Ready to take control of your reputation?
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>
          Join businesses getting more reviews on autopilot.
        </p>
        <Link href="/signup" className="btn-gradient" style={{
          display: "inline-block",
          fontSize: "16px",
          fontWeight: 700,
          color: "#080f22",
          textDecoration: "none",
          padding: "16px 40px",
          borderRadius: "10px",
          boxShadow: "0 0 48px rgba(102,252,241,0.22)",
        }}>
          Start your free trial →
        </Link>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: "16px" }}>
          7 days free · No credit card required
        </p>
      </section>
    </div>
  );
}
