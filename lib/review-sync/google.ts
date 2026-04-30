import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, BusinessRow } from "@/lib/types/database";

type DB = SupabaseClient<Database>;

async function refreshGoogleToken(
  supabase: DB,
  business: BusinessRow
): Promise<string | null> {
  if (!business.google_refresh_token) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: business.google_refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from("businesses")
    .update({
      google_access_token: tokens.access_token,
      google_token_expires_at: expiresAt,
    })
    .eq("id", business.id);

  return tokens.access_token as string;
}

async function getAccessToken(supabase: DB, business: BusinessRow): Promise<string | null> {
  if (!business.google_access_token) return null;

  const isExpired = business.google_token_expires_at
    ? new Date(business.google_token_expires_at) < new Date(Date.now() + 60_000)
    : false;

  if (isExpired) return refreshGoogleToken(supabase, business);
  return business.google_access_token;
}

interface GBPAccount { name: string }
interface GBPLocation { name: string }

interface GBPReview {
  name: string;
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

const STAR_MAP: Record<GBPReview["starRating"], number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

export async function syncGoogleReviews(
  supabase: DB,
  business: BusinessRow
): Promise<{ synced: number; error?: string }> {
  if (!business.google_place_id && !business.google_access_token) {
    return { synced: 0, error: "Google not connected" };
  }

  const token = await getAccessToken(supabase, business);
  if (!token) return { synced: 0, error: "Google token unavailable" };

  // 1. Get the first GBP account
  const accountsRes = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!accountsRes.ok) return { synced: 0, error: "Failed to fetch Google accounts" };

  const { accounts }: { accounts?: GBPAccount[] } = await accountsRes.json();
  const accountName = accounts?.[0]?.name;
  if (!accountName) return { synced: 0, error: "No Google Business account found" };

  // 2. Get locations (businesses)
  const locationsRes = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!locationsRes.ok) return { synced: 0, error: "Failed to fetch Google locations" };

  const { locations }: { locations?: GBPLocation[] } = await locationsRes.json();

  // Match by place ID if multiple locations
  const location = locations?.[0];
  if (!location) return { synced: 0, error: "No Google Business location found" };

  // 3. Fetch reviews
  const reviewsRes = await fetch(
    `https://mybusiness.googleapis.com/v4/${location.name}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!reviewsRes.ok) return { synced: 0, error: "Failed to fetch Google reviews" };

  const { reviews = [] }: { reviews?: GBPReview[] } = await reviewsRes.json();

  if (reviews.length === 0) return { synced: 0 };

  const rows = reviews.map((r) => ({
    business_id: business.id,
    platform: "google" as const,
    external_id: r.reviewId,
    reviewer_name: r.reviewer.displayName,
    reviewer_avatar: r.reviewer.profilePhotoUrl ?? null,
    rating: STAR_MAP[r.starRating],
    body: r.comment ?? null,
    response_text: r.reviewReply?.comment ?? null,
    responded_at: r.reviewReply?.updateTime ?? null,
    status: r.reviewReply ? ("responded" as const) : ("unresponded" as const),
    review_date: r.createTime,
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

export async function postGoogleReply(
  supabase: DB,
  business: BusinessRow,
  reviewExternalId: string,
  replyText: string,
  locationName: string
): Promise<{ ok: boolean; error?: string }> {
  const token = await getAccessToken(supabase, business);
  if (!token) return { ok: false, error: "Google token unavailable" };

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews/${reviewExternalId}/reply`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: replyText }),
    }
  );

  return res.ok ? { ok: true } : { ok: false, error: "Failed to post reply to Google" };
}
