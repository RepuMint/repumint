import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ReviewsClient } from "@/components/dashboard/reviews-client";
import type { Metadata } from "next";
import type { Platform } from "@/lib/types/database";

export const metadata: Metadata = { title: "Reviews" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Layout already confirmed business exists and onboarding is complete.
  // Fetch only the fields this page needs — yelp_url fetched separately
  // so a missing column doesn't kill the whole query.
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, google_access_token, facebook_page_id, tripadvisor_location_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) console.error("[dashboard] business query error:", businessError.message);

  if (!business) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <p style={{ color: "#FF6450", fontSize: "14px" }}>
          Could not load your business data.{" "}
          <a href="/dashboard" style={{ color: "#45A29E", textDecoration: "underline" }}>
            Try refreshing
          </a>
          .
        </p>
      </div>
    );
  }

  // Fetch yelp_url separately — safe to fail if column doesn't exist yet
  const { data: yelpData } = await supabase
    .from("businesses")
    .select("yelp_url")
    .eq("id", business.id)
    .maybeSingle()
    .then((res) => (res.error ? { data: null } : res));

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, platform, reviewer_name, rating, body, response_text, responded_at, status, review_date, review_url, external_id")
    .eq("business_id", business.id)
    .order("review_date", { ascending: false })
    .limit(100);

  const { data: statsRows } = await supabase
    .from("review_stats")
    .select("platform, total_reviews, avg_rating, unresponded_count")
    .eq("business_id", business.id);

  const safeStats = statsRows ?? [];
  const totalReviews = safeStats.reduce((s, r) => s + Number(r.total_reviews), 0);
  const totalUnresponded = safeStats.reduce((s, r) => s + Number(r.unresponded_count), 0);
  const overallAvg = safeStats.length && totalReviews > 0
    ? safeStats.reduce((s, r) => s + Number(r.avg_rating) * Number(r.total_reviews), 0) / totalReviews
    : 0;

  const connectedPlatforms: Platform[] = [];
  if (business.google_access_token) connectedPlatforms.push("google");
  if (business.facebook_page_id) connectedPlatforms.push("facebook");
  if (business.tripadvisor_location_id) connectedPlatforms.push("tripadvisor");

  return (
    <Suspense fallback={null}>
      <ReviewsClient
        reviews={reviews ?? []}
        stats={{ totalReviews, totalUnresponded, overallAvg }}
        connectedPlatforms={connectedPlatforms}
        yelpUrl={yelpData?.yelp_url ?? null}
      />
    </Suspense>
  );
}
