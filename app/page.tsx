export default function HomePage() {
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
        background: "linear-gradient(to bottom, rgba(8,15,34,0.6) 0%, rgba(8,15,34,0.4) 40%, rgba(8,15,34,0.75) 100%)",
        zIndex: 1,
      }} />

      {/* Hero content */}
      <main style={{
        position: "relative",
        zIndex: 5,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
      }}>
        <img
          src="/repumint-logo.png"
          alt="RepuMint"
          style={{
            width: "min(600px, 82vw)",
            height: "auto",
            marginBottom: "36px",
            filter: "drop-shadow(0 4px 48px rgba(102,252,241,0.28))",
          }}
        />

        <div style={{
          display: "inline-block",
          background: "linear-gradient(135deg, #66FCF1 0%, #A8FF3E 100%)",
          borderRadius: "999px",
          padding: "7px 22px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#080f22",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "28px",
        }}>
          Coming Soon
        </div>

        <p style={{
          fontSize: "clamp(18px, 2.2vw, 24px)",
          fontStyle: "italic",
          fontWeight: 400,
          color: "rgba(255,255,255,0.78)",
          letterSpacing: "0.01em",
          lineHeight: 1.5,
          maxWidth: "480px",
        }}>
          More reviews. Better reputation. Less work.
        </p>
      </main>
    </div>
  );
}
