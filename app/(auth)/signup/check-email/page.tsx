export default function CheckEmailPage() {
  return (
    <div
      className="w-full max-w-[420px] rounded-[12px] p-8 sm:p-10 text-center"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(11,27,62,0.08)",
      }}
    >
      {/* Icon */}
      <div
        className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(102,252,241,0.1)" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#66FCF1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.5px",
          color: "#0B1B3E",
          marginBottom: "12px",
        }}
      >
        Check your email
      </h1>
      <p style={{ color: "#4A5568", fontSize: "15px", lineHeight: "1.65" }}>
        We sent you a confirmation link. Click it to verify your email and finish
        setting up your account.
      </p>

      <p
        className="mt-8 text-[13px]"
        style={{ color: "#8892A4" }}
      >
        Didn&apos;t get it? Check your spam folder, or{" "}
        <a
          href="/signup"
          style={{ color: "#45A29E" }}
          className="hover:underline"
        >
          try again with a different email
        </a>
        .
      </p>
    </div>
  );
}
