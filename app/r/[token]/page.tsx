import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { SentimentPage } from "@/components/public/sentiment-page";

export default async function ReviewRequestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServiceClient();

  // Try individual request token first
  const { data: request } = await supabase
    .from("review_requests")
    .select("id, business_id, contact_name, status, directed_to_platform")
    .eq("token", token)
    .maybeSingle();

  let businessId: string;
  let requestId: string | null = null;
  let contactName: string | null = null;
  let isShareable = false;

  if (request) {
    businessId = request.business_id;
    requestId = request.id;
    contactName = request.contact_name;

    // Mark as opened
    if (request.status === "sent" || request.status === "pending") {
      await supabase
        .from("review_requests")
        .update({ status: "opened", opened_at: new Date().toISOString() })
        .eq("id", request.id);
    }
  } else {
    // Try shareable link token on the business
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("shareable_link_token", token)
      .maybeSingle();

    if (!business) notFound();
    businessId = business.id;
    isShareable = true;

    // Create a new review_request for this visit
    const { data: newRequest } = await supabase
      .from("review_requests")
      .insert({
        business_id: businessId,
        channel: "link",
        status: "opened",
        opened_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    requestId = newRequest?.id ?? null;
  }

  // Fetch business details
  const { data: business } = await supabase
    .from("businesses")
    .select("name, category, logo_url, google_place_id, yelp_url, facebook_page_id, tripadvisor_location_id, sentiment_filter_enabled, sentiment_threshold")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) notFound();

  // Build platform options (only connected ones)
  const platforms: { id: string; label: string; url: string; color: string }[] = [];

  if (business.google_place_id) {
    platforms.push({
      id: "google",
      label: "Google",
      url: `https://search.google.com/local/writereview?placeid=${business.google_place_id}`,
      color: "#4285F4",
    });
  }
  if (business.yelp_url) {
    platforms.push({ id: "yelp", label: "Yelp", url: business.yelp_url, color: "#FF1A1A" });
  }
  if (business.facebook_page_id) {
    platforms.push({
      id: "facebook",
      label: "Facebook",
      url: `https://www.facebook.com/${business.facebook_page_id}/reviews`,
      color: "#1877F2",
    });
  }

  return (
    <SentimentPage
      requestId={requestId}
      businessName={business.name}
      businessCategory={business.category}
      logoUrl={business.logo_url}
      contactName={contactName}
      sentimentFilterEnabled={business.sentiment_filter_enabled ?? true}
      sentimentThreshold={business.sentiment_threshold ?? 4}
      platforms={platforms}
      token={token}
    />
  );
}
