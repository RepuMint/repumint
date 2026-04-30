"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signup, null);

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
          Start your free trial
        </h1>
        <p style={{ color: "#4A5568", fontSize: "15px" }}>
          7 days free, no credit card required.
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
            htmlFor="name"
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
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Jamie Rivera"
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
          {state?.fieldErrors?.name && (
            <p className="mt-1.5 text-sm" style={{ color: "#FF6450" }}>
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

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
            Work email
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
          {state?.fieldErrors?.email && (
            <p className="mt-1.5 text-sm" style={{ color: "#FF6450" }}>
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
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
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Min. 8 characters"
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
          {state?.fieldErrors?.password && (
            <p className="mt-1.5 text-sm" style={{ color: "#FF6450" }}>
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full rounded-lg py-3 text-[15px]"
        >
          {pending ? "Creating account…" : "Create account — it's free"}
        </button>

        <p
          className="text-center text-[12px]"
          style={{ color: "#8892A4" }}
        >
          By creating an account you agree to our{" "}
          <Link href="/terms" style={{ color: "#8892A4" }} className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "#8892A4" }} className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p
        className="mt-6 text-center text-[14px]"
        style={{ color: "#4A5568" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "#45A29E", fontWeight: 600 }}
          className="hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
