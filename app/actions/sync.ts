"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncGoogleReviews } from "@/lib/review-sync/google";
import { syncFacebookReviews } from "@/lib/review-sync/facebook";
import { syncTripAdvisorReviews } from "@/lib/review-sync/tripadvisor";

export type SyncResult = {
  google: { synced: number; error?: string };
  facebook: { synced: number; error?: string };
  tripadvisor: { synced: number; error?: string };
  total: number;
};

export async function syncAllReviews(): Promise<SyncResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  // Use service client for upserts so we're not blocked by RLS on the reviews table
  const serviceSupabase = await createServiceClient();

  const [google, facebook, tripadvisor] = await Promise.all([
    syncGoogleReviews(serviceSupabase, business),
    syncFacebookReviews(serviceSupabase, business),
    syncTripAdvisorReviews(serviceSupabase, business),
  ]);

  revalidatePath("/dashboard");

  return {
    google,
    facebook,
    tripadvisor,
    total: google.synced + facebook.synced + tripadvisor.synced,
  };
}
