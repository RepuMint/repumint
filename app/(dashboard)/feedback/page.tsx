import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedbackClient } from "@/components/dashboard/feedback-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Feedback" };

export default async function FeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const { data: feedback } = await supabase
    .from("feedback")
    .select("id, contact_name, contact_phone, contact_email, rating, body, status, owner_notes, resolved_at, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const items = feedback ?? [];
  const newCount = items.filter((f) => f.status === "new").length;

  return (
    <FeedbackClient feedback={items} newCount={newCount} />
  );
}
