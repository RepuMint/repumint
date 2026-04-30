import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";

export type BusinessSummary = {
  id: string;
  name: string;
  onboarding_completed: boolean;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch ALL businesses for this owner (supports multi-business)
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, onboarding_completed")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const allBusinesses: BusinessSummary[] = businesses ?? [];

  // If no businesses at all, send to onboarding
  if (allBusinesses.length === 0) redirect("/onboarding");

  // Determine the active business from cookie, falling back to first completed one
  const cookieStore = await cookies();
  const activeBid = cookieStore.get("active_business_id")?.value;

  const business =
    allBusinesses.find((b) => b.id === activeBid && b.onboarding_completed) ??
    allBusinesses.find((b) => b.onboarding_completed) ??
    allBusinesses[0];

  if (!business.onboarding_completed) redirect("/onboarding");

  // Subscription for the active business
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, trial_ends_at")
    .eq("business_id", business.id)
    .maybeSingle();

  return (
    <DashboardShell
      activeBusiness={business}
      allBusinesses={allBusinesses}
      plan={subscription?.plan ?? "trial"}
      status={subscription?.status ?? "trialing"}
      trialEndsAt={subscription?.trial_ends_at ?? null}
    >
      {children}
    </DashboardShell>
  );
}
