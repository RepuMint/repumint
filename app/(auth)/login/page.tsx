"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";

const inputStyle: React.CSSProperties = {
  width: "100%", borderRadius: "8px", padding: "11px 14px",
  fontSize: "15px", color: "#0B1B3E", outline: "none",
  border: "1px solid rgba(11,27,62,0.15)",
  backgroundColor: "#FFFFFF",
  fontFamily: "var(--font-sans)",
  transition: "border-color 120ms ease, box-shadow 120ms ease",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 600,
  letterSpacing: "0.05em", textTransform: "uppercase",
  color: "#0B1B3E", marginBottom: "6px",
};

function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";
  const resetSent = searchParams.get("reset") === "sent";
  const errorParam = searchParams.get("error");

  return (
    <>
      {resetSent && (
        <div style={{
          marginBottom: "20px", padding: "12px 14px", borderRadius: "8px",
          backgroundColor: "rgba(102,252,241,0.08)", border: "1px solid rgba(102,252,241,0.25)",
          fontSize: "13px", color: "#45A29E",
        }}>
          Password reset email sent — check your inbox.
        </div>
      )}

      {(state?.error || errorParam) && (
        <div style={{
          marginBottom: "20px", padding: "12px 14px", borderRadius: "8px",
          backgroundColor: "rgba(255,100,80,0.06)", border: "1px solid rgba(255,100,80,0.2)",
          fontSize: "13px", color: "#FF6450",
        }}>
          {state?.error ?? "Something went wrong. Please try again."}
        </div>
      )}

      <form action={action} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required
            placeholder="jamie@rustyanchor.com" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {state?.fieldErrors?.email && (
            <p style={{ fontSize: "12px", color: "#FF6450", marginTop: "5px" }}>{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: "12px", color: "#45A29E", textDecoration: "none", fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <input id="password" name="password" type="password" autoComplete="current-password" required
            placeholder="••••••••" style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {state?.fieldErrors?.password && (
            <p style={{ fontSize: "12px", color: "#FF6450", marginTop: "5px" }}>{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button type="submit" disabled={pending}
          className="btn-primary w-full rounded-lg py-3 text-[15px]"
          style={{ marginTop: "4px" }}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#4A5568" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#45A29E", fontWeight: 600, textDecoration: "none" }}>
          Start free trial
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      width: "100%", maxWidth: "400px",
      backgroundColor: "#FFFFFF", borderRadius: "16px",
      padding: "36px 40px",
      border: "1px solid rgba(11,27,62,0.08)",
      boxShadow: "0 4px 24px rgba(11,27,62,0.06)",
    }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "24px", fontWeight: 700, letterSpacing: "-0.75px",
          color: "#0B1B3E", marginBottom: "6px",
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "14px", color: "#8892A4", lineHeight: "1.5" }}>
          Sign in to your account to continue.
        </p>
      </div>

      <Suspense fallback={<div style={{ height: "240px" }} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
