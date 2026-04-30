import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";

const VALUES = [
  {
    icon: "🎯",
    title: "Built for small businesses",
    body: "We designed RepuMint for the local restaurant, the plumber, the salon owner — not enterprise chains with dedicated marketing teams. It should just work.",
  },
  {
    icon: "🔒",
    title: "Privacy first",
    body: "Private feedback stays private. We never share or surface negative feedback publicly. Your customers' trust is your most valuable asset — we take that seriously.",
  },
  {
    icon: "⚡",
    title: "Speed over complexity",
    body: "You're running a business, not babysitting software. RepuMint is opinionated and fast — set it up once and let it run.",
  },
  {
    icon: "💬",
    title: "Honest pricing",
    body: "No hidden fees, no usage traps, no \"contact us for pricing.\" You see the price, you know what you get, and you can cancel any time.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", backgroundColor: "#F4F6FA" }}>
      <LandingNav active="about" />

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
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(102,252,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(102,252,241,0.1)",
            border: "1px solid rgba(102,252,241,0.2)",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#66FCF1",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "28px",
          }}>
            Our story
          </div>
          <h1 style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}>
            Built for the businesses<br />
            <span style={{ background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              that build your town
            </span>
          </h1>
          <p style={{
            fontSize: "clamp(17px, 1.8vw, 20px)",
            color: "rgba(255,255,255,0.58)",
            lineHeight: 1.7,
            maxWidth: "580px",
            margin: "0 auto",
          }}>
            We started RepuMint because the tools that exist are built for enterprise teams with dedicated marketing staff — not for the owner who also answers the phone, takes the orders, and locks up at night.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "96px 24px", maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ borderLeft: "3px solid #66FCF1", paddingLeft: "28px", marginBottom: "64px" }}>
          <p style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 700, color: "#0B1B3E", lineHeight: 1.5, fontStyle: "italic", marginBottom: "0" }}>
            "Every local business deserves a fighting chance online. A few missing reviews or one bad public complaint can cost months of hard work. We built RepuMint to fix that — automatically, affordably, and without requiring a marketing degree."
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              The problem
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(11,27,62,0.6)", lineHeight: 1.75, marginBottom: "16px" }}>
              Online reviews are one of the most powerful drivers of new business — and one of the most unpredictable. Customers who had a great experience rarely think to leave a review. Customers who had a bad one almost always do.
            </p>
            <p style={{ fontSize: "15px", color: "rgba(11,27,62,0.6)", lineHeight: 1.75 }}>
              The result? Your average rating doesn't reflect the experience you actually deliver. And there's nothing you can do about it — unless you have a system.
            </p>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              Our answer
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(11,27,62,0.6)", lineHeight: 1.75, marginBottom: "16px" }}>
              RepuMint is that system. We make it effortless to ask every customer for a review at the right moment, route them to the right platform, and intercept unhappy customers before they go public.
            </p>
            <p style={{ fontSize: "15px", color: "rgba(11,27,62,0.6)", lineHeight: 1.75 }}>
              The result is a steady, reliable flow of genuine positive reviews — and a private channel for the feedback that helps you improve.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        background: "#0B1B3E",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "4px" }}>
          {[
            { stat: "15 min", label: "Average setup time" },
            { stat: "4.8★", label: "Average customer rating after 90 days" },
            { stat: "3×", label: "More reviews vs. asking manually" },
            { stat: "100%", label: "Private feedback stays private" },
          ].map((item) => (
            <div key={item.stat} style={{
              textAlign: "center",
              padding: "36px 24px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.04)",
            }}>
              <div style={{
                fontSize: "40px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                marginBottom: "10px",
              }}>
                {item.stat}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "96px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: "#0B1B3E", letterSpacing: "-0.02em", marginBottom: "14px" }}>
            What we believe
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(11,27,62,0.5)", maxWidth: "440px", margin: "0 auto" }}>
            The values behind every decision we make.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "32px 28px",
              border: "1px solid rgba(11,27,62,0.07)",
              boxShadow: "0 2px 12px rgba(11,27,62,0.04)",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{v.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0B1B3E", marginBottom: "10px" }}>{v.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(11,27,62,0.58)", lineHeight: 1.65 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section style={{
        background: "#0B1B3E",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: "20px" }}>
            Who RepuMint is for
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "40px" }}>
            If you run a local business and online reviews matter to how customers find you, RepuMint is for you.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            {[
              "Restaurants & cafés",
              "Auto repair shops",
              "Salons & spas",
              "Dentists & medical",
              "Hotels & lodging",
              "Contractors",
              "Retail stores",
              "Home services",
              "Gyms & fitness",
              "Pet services",
            ].map((type) => (
              <span key={type} style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "999px",
                padding: "8px 18px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
              }}>
                {type}
              </span>
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
          Ready to build a better reputation?
        </h2>
        <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", marginBottom: "40px" }}>
          Start your free trial — no credit card required.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
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
          <Link href="/pricing" style={{
            display: "inline-block",
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.65)",
            textDecoration: "none",
            padding: "16px 32px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
