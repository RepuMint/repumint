export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F4F6FA", display: "flex", flexDirection: "column" }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 16px",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "block", marginBottom: "10px" }}>
          <img src="/repumint-logo.png" alt="RepuMint" style={{ height: "28px", width: "auto" }} />
        </a>

        {/* Tagline */}
        <p style={{
          fontSize: "14px", color: "#8892A4", marginBottom: "32px",
          letterSpacing: "0.01em",
        }}>
          More reviews. Fewer bad ones. Built for small businesses.
        </p>

        {children}
      </div>

      <footer style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#8892A4" }}>
          © {new Date().getFullYear()} RepuMint ·{" "}
          <a href="/privacy" style={{ color: "#8892A4" }}>Privacy</a>
          {" · "}
          <a href="/terms" style={{ color: "#8892A4" }}>Terms</a>
        </p>
      </footer>
    </div>
  );
}
