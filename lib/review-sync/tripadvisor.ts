import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BusinessRow } from "@/lib/types/database";

type DB = SupabaseClient<Database>;

interface TAReview {
  id: number;
  rating: number;
  title?: string;
  text?: string;
  travel_date?: string;
  published_date: string;
  url: string;
  user: { username: string; avatar?: { thumbnail?: string } };
}

export async function syncTripAdvisorReviews(
  supabase: DB,
  business: BusinessRow
): Promise<{ synced: number; error?: string }> {
  if (!business.tripadvisor_location_id) {
    return { synced: 0, error: "TripAdvisor not connected" };
  }

  const apiKey = process.env.TRIPADVISOR_API_KEY;
  if (!apiKey) return { synced: 0, error: "TripAdvisor API key not configured" };

  const res = await fetch(
    `https://api.content.tripadvisor.com/api/v1/location/${business.tripadvisor_location_id}/reviews?` +
    new URLSearchParams({ key: apiKey, language: "en" }),
    { headers: { Accept: "application/json" } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { synced: 0, error: err?.message ?? "Failed to fetch TripAdvisor reviews" };
  }

  const { data: reviews = [] }: { data?: TAReview[] } = await res.json();

  if (reviews.length === 0) return { synced: 0 };

  const rows = reviews.map((r) => ({
    business_id: business.id,
    platform: "tripadvisor" as const,
    external_id: String(r.id),
    reviewer_name: r.user.username,
    reviewer_avatar: r.user.avatar?.thumbnail ?? null,
    rating: Math.round(r.rating),
    body: [r.title, r.text].filter(Boolean).join("\n\n") || null,
    review_url: r.url,
    response_text: null,
    responded_at: null,
    status: "unresponded" as const,
    review_date: r.published_date,
    raw_data: r as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("reviews").upsert(rows, {
    onConflict: "business_id,platform,external_id",
    ignoreDuplicates: false,
  });

  if (error) return { synced: 0, error: error.message };
  return { synced: rows.length };
}
