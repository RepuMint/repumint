import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: business } = await supabase
      .from("businesses")
      .select("onboarding_completed")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!business || !business.onboarding_completed) redirect("/onboarding");
    redirect("/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      fontFamily: "var(--font-sans)",
      overflow: "hidden",
    }}>
      {/* Full-screen background image */}
      <img
        src="/repumint-homepage.png"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(8,15,34,0.6) 0%, rgba(8,15,34,0.4) 40%, rgba(8,15,34,0.7) 100%)",
        zIndex: 1,
      }} />

      {/* Top navigation */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: "72px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(8,15,34,0.3)",
        borderBottom: "1px solid rgba(102,252,241,0.08)",
      }}>
        {/* Logo — left */}
        <img
          src="/repumint-logo.png"
          alt="RepuMint"
          style={{ height: "100px", width: "auto" }}
        />

        {/* Nav links — center */}
        <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          {["Product", "Pricing", "About"].map((label) => (
            <Link key={label} href={`/${label.toLowerCase()}`} className="landing-nav-link">
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth — right */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/login" style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            transition: "color 120ms ease",
          }}>
            Sign in
          </Link>
          <Link href="/signup" className="btn-gradient" style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#080f22",
            textDecoration: "none",
            padding: "9px 20px",
            borderRadius: "8px",
          }}>
            Get started free
          </Link>
        </div>
      </header>

      {/* Hero content */}
      <main style={{
        position: "relative",
        zIndex: 5,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
      }}>
        {/* Big logo — focal point */}
        <img
          src="/repumint-logo.png"
          alt="RepuMint"
          style={{
            width: "min(680px, 88vw)",
            height: "auto",
            marginBottom: "28px",
            filter: "drop-shadow(0 4px 48px rgba(102,252,241,0.28))",
          }}
        />

        {/* Italic tagline */}
        <p style={{
          fontSize: "clamp(19px, 2.4vw, 26px)",
          fontStyle: "italic",
          fontWeight: 400,
          color: "rgba(255,255,255,0.82)",
          letterSpacing: "0.01em",
          marginBottom: "48px",
          lineHeight: 1.4,
        }}>
          More reviews. Better reputation. Less work.
        </p>

        {/* CTA group */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <Link href="/signup" className="btn-gradient" style={{
            display: "inline-block",
            fontSize: "16px",
            fontWeight: 700,
            color: "#080f22",
            textDecoration: "none",
            padding: "16px 40px",
            borderRadius: "10px",
            letterSpacing: "0.01em",
            boxShadow: "0 0 48px rgba(102,252,241,0.22)",
          }}>
            Start your free trial →
          </Link>
          <p style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.02em",
          }}>
            7 days free · No credit card required · Up and running in 15 minutes
          </p>
        </div>
      </main>

      <style>{`
        .landing-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 120ms ease;
        }
        .landing-nav-link:hover { color: #66FCF1; }

        .btn-gradient {
          background: linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%);
          transition: opacity 120ms ease, box-shadow 120ms ease;
        }
        .btn-gradient:hover {
          opacity: 0.92;
          box-shadow: 0 0 56px rgba(102,252,241,0.35) !important;
        }

        @media (max-width: 640px) {
          header nav { display: none; }
          header { padding: 0 20px; }
        }
      `}</style>
    </div>
  );
}
