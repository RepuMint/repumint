import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F6FA" }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid rgba(11,27,62,0.08)",
        }}
      >
        <img src="/repumint-logo.png" alt="RepuMint" className="h-7 w-auto" />
        <p style={{ fontSize: "13px", color: "#8892A4" }}>
          Setup — takes about 5 minutes
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">{children}</main>
    </div>
  );
}
