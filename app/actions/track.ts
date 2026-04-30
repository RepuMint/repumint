"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function markRequestClicked(
  requestId: string,
  platform: string | null,
  rating: number
) {
  const supabase = await createServiceClient();
  await supabase
    .from("review_requests")
    .update({
      status: "clicked",
      clicked_at: new Date().toISOString(),
      directed_to_platform: platform as "google" | "yelp" | "facebook" | "tripadvisor" | null,
      sentiment_shown: true,
      sentiment_response: rating,
      sentiment_shown_at: new Date().toISOString(),
    })
    .eq("id", requestId);
}
