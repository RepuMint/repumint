"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackStatus } from "@/lib/types/database";

async function getOwnedFeedback(feedbackId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("feedback")
    .select("id, business_id, businesses!inner(owner_id)")
    .eq("id", feedbackId)
    .maybeSingle();

  const biz = data?.businesses as unknown as { owner_id: string } | null;
  if (!data || biz?.owner_id !== user.id) return null;
  return { supabase, feedbackId };
}

export async function updateFeedbackStatus(feedbackId: string, status: FeedbackStatus) {
  const ctx = await getOwnedFeedback(feedbackId);
  if (!ctx) return;

  await ctx.supabase
    .from("feedback")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", feedbackId);

  revalidatePath("/feedback");
}

export async function saveFeedbackNotes(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const id = formData.get("feedbackId") as string;
  const notes = z.string().max(2000).trim().safeParse(formData.get("notes"));

  if (!notes.success) return { error: "Notes too long." };

  const ctx = await getOwnedFeedback(id);
  if (!ctx) return { error: "Not found." };

  await ctx.supabase
    .from("feedback")
    .update({ owner_notes: notes.data || null })
    .eq("id", id);

  revalidatePath("/feedback");
  return null;
}
