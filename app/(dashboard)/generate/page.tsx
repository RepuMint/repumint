import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GenerateClient } from "@/components/dashboard/generate-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Get Reviews" };

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, shareable_link_token, google_place_id, yelp_url, facebook_page_id, tripadvisor_location_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  // Recent requests (last 25)
  const { data: recentRequests } = await supabase
    .from("review_requests")
    .select("id, channel, status, contact_name, contact_phone, contact_email, sent_at, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareableUrl = `${appUrl}/r/${business.shareable_link_token}`;

  const hasAnyPlatform = !!(
    business.google_place_id ||
    business.yelp_url ||
    business.facebook_page_id ||
    business.tripadvisor_location_id
  );

  return (
    <GenerateClient
      businessName={business.name}
      shareableUrl={shareableUrl}
      hasAnyPlatform={hasAnyPlatform}
      recentRequests={recentRequests ?? []}
      appUrl={appUrl}
    />
  );
}
