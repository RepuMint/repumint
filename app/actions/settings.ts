"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: string; success?: string } | null;

export async function updateLogoUrl(url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("businesses").update({ logo_url: url }).eq("owner_id", user.id);
  revalidatePath("/settings");
}

export async function saveBusinessInfo(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const schema = z.object({
    name: z.string().min(2).trim(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    website: formData.get("website") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
    zip: formData.get("zip") || undefined,
  });

  if (!parsed.success) return { error: "Check your inputs and try again." };

  const { error } = await supabase
    .from("businesses")
    .update(parsed.data)
    .eq("owner_id", user.id);

  if (error) return { error: "Failed to save. Please try again." };

  revalidatePath("/settings");
  return { success: "Business info saved." };
}

export async function saveSentimentConfig(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enabled = formData.get("sentiment_filter_enabled") === "true";
  const threshold = Math.min(5, Math.max(1, parseInt(formData.get("sentiment_threshold") as string, 10) || 4));

  await supabase
    .from("businesses")
    .update({ sentiment_filter_enabled: enabled, sentiment_threshold: threshold })
    .eq("owner_id", user.id);

  revalidatePath("/settings");
  return { success: "Sentiment filter updated." };
}

export async function saveTripadvisorConnection(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const locationId = (formData.get("tripadvisor_location_id") as string)?.trim() || null;
  const apiKey = (formData.get("tripadvisor_api_key") as string)?.trim() || null;

  await supabase
    .from("businesses")
    .update({ tripadvisor_location_id: locationId, tripadvisor_api_key: apiKey })
    .eq("owner_id", user.id);

  revalidatePath("/settings");
  return { success: "TripAdvisor connection saved." };
}

export async function saveYelpUrl(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const url = (formData.get("yelp_url") as string)?.trim() || null;

  await supabase
    .from("businesses")
    .update({ yelp_url: url })
    .eq("owner_id", user.id);

  revalidatePath("/settings");
  return { success: "Yelp URL saved." };
}

export async function disconnectPlatform(platform: "google" | "facebook") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates =
    platform === "google"
      ? { google_access_token: null, google_refresh_token: null, google_token_expires_at: null }
      : { facebook_access_token: null, facebook_token_expires_at: null };

  await supabase.from("businesses").update(updates).eq("owner_id", user.id);
  revalidatePath("/settings");
}
