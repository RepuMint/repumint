import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";
import type { Metadata } from "next";
import type { Platform } from "@/lib/types/database";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  // Platform stats from view
  const { data: platformStats } = await supabase
    .from("review_stats")
    .select("platform, total_reviews, avg_rating, unresponded_count, five_star_count, four_star_count, three_star_count, two_star_count, one_star_count")
    .eq("business_id", business.id);

  // All reviews for time-series (last 12 months)
  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  since.setDate(1);

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select("review_date, rating, platform, status")
    .eq("business_id", business.id)
    .gte("review_date", since.toISOString())
    .order("review_date", { ascending: true });

  // Feedback count
  const { count: feedbackCount } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const stats = platformStats ?? [];
  const reviews = recentReviews ?? [];

  const totalReviews = stats.reduce((s, r) => s + Number(r.total_reviews), 0);
  const totalUnresponded = stats.reduce((s, r) => s + Number(r.unresponded_count), 0);
  const overallAvg = totalReviews > 0
    ? stats.reduce((s, r) => s + Number(r.avg_rating) * Number(r.total_reviews), 0) / totalReviews
    : 0;
  const responseRate = totalReviews > 0
    ? Math.round(((totalReviews - totalUnresponded) / totalReviews) * 100)
    : 0;

  // Build monthly buckets
  const months: { label: string; count: number; avg: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const bucket = reviews.filter((r) => r.review_date?.startsWith(key));
    const avg = bucket.length > 0 ? bucket.reduce((s, r) => s + r.rating, 0) / bucket.length : 0;
    months.push({ label, count: bucket.length, avg: Math.round(avg * 10) / 10 });
  }

  const platformBreakdown = stats.map((s) => ({
    platform: s.platform as Platform,
    total: Number(s.total_reviews),
    avg: Number(s.avg_rating),
    fiveStars: Number(s.five_star_count),
    unresponded: Number(s.unresponded_count),
  }));

  return (
    <AnalyticsClient
      summary={{ totalReviews, overallAvg, responseRate, feedbackCount: feedbackCount ?? 0 }}
      months={months}
      platformBreakdown={platformBreakdown}
    />
  );
}
