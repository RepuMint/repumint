import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BusinessRow } from "@/lib/types/database";

type DB = SupabaseClient<Database>;

interface FBRating {
  recommendation_type?: "positive" | "negative";
  rating?: number;
  review_text?: string;
  created_time: string;
  reviewer: { name: string; id: string };
  open_graph_story?: { id: string };
}

// Facebook Recommendations use positive/negative, not 1-5 stars.
// Positive → 5, Negative → 1. Ratings without a recommendation are omitted.
function resolveRating(r: FBRating): number | null {
  if (r.rating) return Math.round(r.rating);
  if (r.recommendation_type === "positive") return 5;
  if (r.recommendation_type === "negative") return 1;
  return null;
}

export async function syncFacebookReviews(
  supabase: DB,
  business: BusinessRow
): Promise<{ synced: number; error?: string }> {
  if (!business.facebook_access_token || !business.facebook_page_id) {
    return { synced: 0, error: "Facebook not connected" };
  }

  // Check token expiry (rough check)
  if (
    business.facebook_token_expires_at &&
    new Date(business.facebook_token_expires_at) < new Date()
  ) {
    return { synced: 0, error: "Facebook token expired — reconnect in Settings" };
  }

  const token = business.facebook_access_token;
  const pageId = business.facebook_page_id;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/ratings?` +
    new URLSearchParams({
      fields: "recommendation_type,review_text,created_time,reviewer,rating,open_graph_story",
      limit: "50",
      access_token: token,
    })
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { synced: 0, error: err?.error?.message ?? "Failed to fetch Facebook reviews" };
  }

  const { data: ratings = [] }: { data?: FBRating[] } = await res.json();

  type ReviewRow = {
    business_id: string; platform: "facebook"; external_id: string;
    reviewer_name: string; reviewer_avatar: null; rating: number;
    body: string | null; response_text: null; responded_at: null;
    status: "unresponded"; review_date: string;
    raw_data: Record<string, unknown>; synced_at: string;
  };

  const rows: ReviewRow[] = ratings
    .map((r): ReviewRow | null => {
      const rating = resolveRating(r);
      if (!rating) return null;
      const externalId = r.open_graph_story?.id ?? `fb-${r.reviewer.id}-${r.created_time}`;
      return {
        business_id: business.id,
        platform: "facebook",
        external_id: externalId,
        reviewer_name: r.reviewer.name,
        reviewer_avatar: null,
        rating,
        body: r.review_text ?? null,
        response_text: null,
        responded_at: null,
        status: "unresponded",
        review_date: r.created_time,
        raw_data: r as unknown as Record<string, unknown>,
        synced_at: new Date().toISOString(),
      };
    })
    .filter((r): r is ReviewRow => r !== null);

  if (rows.length === 0) return { synced: 0 };

  const { error } = await supabase.from("reviews").upsert(rows, {
    onConflict: "business_id,platform,external_id",
    ignoreDuplicates: false,
  });

  if (error) return { synced: 0, error: error.message };
  return { synced: rows.length };
}
