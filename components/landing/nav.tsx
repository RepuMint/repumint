import Link from "next/link";

const NAV_LINKS = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function LandingNav({ active }: { active?: "product" | "pricing" | "about" }) {
  return (
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
      backgroundColor: "rgba(8,15,34,0.72)",
      borderBottom: "1px solid rgba(102,252,241,0.08)",
    }}>
      <Link href="/" style={{ lineHeight: 0 }}>
        <img
          src="/repumint-logo.png"
          alt="RepuMint"
          style={{ height: "100px", width: "auto" }}
        />
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={`landing-nav-link${active === label.toLowerCase() ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

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
          display: "inline-block",
        }}>
          Get started free
        </Link>
      </div>

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
        .landing-nav-link.active { color: #66FCF1; }

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
    </header>
  );
}
