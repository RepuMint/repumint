import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/dashboard/settings-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, category, phone, email, website, address, city, state, zip, logo_url, google_place_id, google_access_token, google_token_expires_at, yelp_url, yelp_business_id, facebook_page_id, facebook_access_token, facebook_token_expires_at, tripadvisor_location_id, tripadvisor_api_key, sentiment_filter_enabled, sentiment_threshold, default_sms_template, default_email_template, default_email_subject")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <SettingsClient
      business={business}
      userId={user.id}
      ownerEmail={user.email ?? ""}
      appUrl={appUrl}
      flash={params.connected ? `${params.connected} connected successfully` : params.error ? `Error: ${params.error.replace(/_/g, " ")}` : null}
      flashType={params.connected ? "success" : params.error ? "error" : null}
    />
  );
}
