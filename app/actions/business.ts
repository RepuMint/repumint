"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const BusinessSetupSchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters." }).trim(),
  category: z.enum([
    "restaurant", "cafe", "bar", "salon", "spa", "barbershop",
    "studio", "gym", "retail", "other",
  ]),
  phone: z.string().optional(),
  email: z.string().email({ message: "Enter a valid email." }).optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }).trim(),
  state: z.string().length(2, { message: "Enter a 2-letter state code." }).trim().toUpperCase(),
  zip: z.string().optional(),
  website: z.string().url({ message: "Enter a valid URL." }).optional().or(z.literal("")),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  let slug = slugify(base);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data) return candidate;
    suffix++;
  }
}

/** Returns the most recent incomplete business for this user, or null. */
async function getIncompleteBusinessForUser(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId)
    .eq("onboarding_completed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export type BusinessSetupState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
} | null;

export async function createBusiness(
  _prevState: BusinessSetupState,
  formData: FormData
): Promise<BusinessSetupState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const raw = {
    name: formData.get("name"),
    category: formData.get("category"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip") || undefined,
    website: formData.get("website") || undefined,
  };

  const parsed = BusinessSetupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // If there's an incomplete business in progress, resume it (handles both
  // double-submit on first setup and abandoned second-business setups).
  const incomplete = await getIncompleteBusinessForUser(user.id, supabase);
  if (incomplete) {
    await supabase
      .from("businesses")
      .update({ onboarding_step: 2, ...parsed.data })
      .eq("id", incomplete.id);

    revalidatePath("/onboarding");
    redirect("/onboarding/platforms");
  }

  const slug = await uniqueSlug(parsed.data.name, supabase);

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: user.id,
      slug,
      onboarding_step: 2,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error || !business) {
    return { error: "Failed to create your business. Please try again." };
  }

  await supabase.from("subscriptions").insert({
    business_id: business.id,
    owner_id: user.id,
    plan: "trial",
    status: "trialing",
    monthly_sms_limit: 50,
    monthly_email_limit: 500,
  });

  revalidatePath("/onboarding");
  redirect("/onboarding/platforms");
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const incomplete = await getIncompleteBusinessForUser(user.id, supabase);
  if (!incomplete) redirect("/dashboard");

  await supabase
    .from("businesses")
    .update({ onboarding_completed: true, onboarding_step: 5 })
    .eq("id", incomplete.id);

  // Switch the active business cookie to the newly completed one
  const cookieStore = await cookies();
  cookieStore.set("active_business_id", incomplete.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function savePlatformConnections(
  _prevState: BusinessSetupState,
  formData: FormData
): Promise<BusinessSetupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getIncompleteBusinessForUser(user.id, supabase);
  if (!business) redirect("/onboarding");

  const updates: Record<string, string | null> = {};

  const googlePlaceId = formData.get("google_place_id") as string | null;
  const yelpUrl = formData.get("yelp_url") as string | null;
  const facebookPageId = formData.get("facebook_page_id") as string | null;
  const tripadvisorId = formData.get("tripadvisor_location_id") as string | null;

  if (googlePlaceId) updates.google_place_id = googlePlaceId;
  if (yelpUrl) updates.yelp_url = yelpUrl;
  if (facebookPageId) updates.facebook_page_id = facebookPageId;
  if (tripadvisorId) updates.tripadvisor_location_id = tripadvisorId;

  await supabase
    .from("businesses")
    .update({ ...updates, onboarding_step: 3 })
    .eq("id", business.id);

  revalidatePath("/onboarding");
  redirect("/onboarding/sentiment");
}

export async function saveSentimentSettings(
  _prevState: BusinessSetupState,
  formData: FormData
): Promise<BusinessSetupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getIncompleteBusinessForUser(user.id, supabase);
  if (!business) redirect("/onboarding");

  const enabled = formData.get("sentiment_filter_enabled") === "true";
  const threshold = parseInt(formData.get("sentiment_threshold") as string, 10) || 4;

  await supabase
    .from("businesses")
    .update({
      sentiment_filter_enabled: enabled,
      sentiment_threshold: Math.min(Math.max(threshold, 1), 5),
      onboarding_step: 4,
    })
    .eq("id", business.id);

  revalidatePath("/onboarding");
  redirect("/onboarding/done");
}
