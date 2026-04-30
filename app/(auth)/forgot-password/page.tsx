"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    forgotPassword,
    null
  );

  return (
    <div
      className="w-full max-w-[420px] rounded-[12px] p-8 sm:p-10"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(11,27,62,0.08)",
      }}
    >
      <div className="mb-8">
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 600,
            letterSpacing: "-1px",
            color: "#0B1B3E",
            marginBottom: "8px",
          }}
        >
          Reset your password
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px" }}>
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {state?.error && (
        <div
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(255,100,80,0.06)",
            border: "1px solid rgba(255,100,80,0.2)",
            color: "#FF6450",
          }}
        >
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#0B1B3E",
              marginBottom: "6px",
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="jamie@rustyanchor.com"
            className="w-full rounded-lg px-4 py-3 text-[15px] outline-none transition-all"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(11,27,62,0.15)",
              color: "#0B1B3E",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid rgba(168,255,62,0.5)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(168,255,62,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgba(11,27,62,0.15)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full rounded-lg py-3 text-[15px]"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px]" style={{ color: "#4A5568" }}>
        <Link
          href="/login"
          style={{ color: "#45A29E", fontWeight: 600 }}
          className="hover:underline"
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
