"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOwnerNotification } from "@/lib/email";
import type { FeedbackFormState } from "@/components/public/feedback-form-page";

const Schema = z.object({
  requestId: z.string().uuid(),
  businessId: z.string().uuid(),
  contact_name: z.string().trim().optional(),
  contact_phone: z.string().trim().optional(),
  contact_email: z.string().email().trim().optional().or(z.literal("")),
  body: z.string().min(1, { message: "Please tell us what happened." }).max(4000).trim(),
  rating: z.coerce.number().min(1).max(5).optional(),
});

export async function submitFeedback(
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const parsed = Schema.safeParse({
    requestId: formData.get("requestId"),
    businessId: formData.get("businessId"),
    contact_name: formData.get("contact_name") || undefined,
    contact_phone: formData.get("contact_phone") || undefined,
    contact_email: formData.get("contact_email") || undefined,
    body: formData.get("body"),
    rating: formData.get("rating") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your inputs." };
  }

  const { requestId, businessId, contact_name, contact_phone, contact_email, body, rating } = parsed.data;

  const supabase = await createServiceClient();

  // Validate the request exists and belongs to this business
  const { data: request } = await supabase
    .from("review_requests")
    .select("id, status")
    .eq("id", requestId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!request) return { error: "Request not found." };

  // Save feedback
  const { data: feedback, error: insertError } = await supabase
    .from("feedback")
    .insert({
      business_id: businessId,
      review_request_id: requestId,
      contact_name: contact_name ?? null,
      contact_phone: contact_phone ?? null,
      contact_email: contact_email ?? null,
      rating: rating ?? null,
      body,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError || !feedback) {
    return { error: "Failed to submit feedback. Please try again." };
  }

  // Update review request status
  await supabase
    .from("review_requests")
    .update({
      status: "feedback_given",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  // Fetch owner info for notification
  const { data: business } = await supabase
    .from("businesses")
    .select("name, owner_id, auth.users!inner(email)")
    .eq("id", businessId)
    .maybeSingle();

  // Send instant notification to owner
  try {
    const { data: owner } = await supabase.auth.admin.getUserById(
      (business as unknown as { owner_id: string })?.owner_id ?? ""
    );
    const ownerEmail = owner?.user?.email;
    const businessName = (business as unknown as { name: string })?.name ?? "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (ownerEmail && businessName) {
      await sendOwnerNotification({
        ownerEmail,
        businessName,
        contactName: contact_name,
        contactPhone: contact_phone,
        contactEmail: contact_email,
        rating,
        feedbackBody: body,
        feedbackId: feedback.id,
        appUrl,
      });
    }
  } catch {
    // Notification failure is non-fatal — feedback is already saved
  }

  return { submitted: true };
}
