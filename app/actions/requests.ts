"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/twilio";
import { sendReviewRequestEmail } from "@/lib/email";

export type RequestState = {
  error?: string;
  success?: string;
  requestId?: string;
} | null;

const SendSchema = z.object({
  contact_name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email().trim().optional(),
  channel: z.enum(["sms", "email"]),
});

export async function sendReviewRequest(
  _prevState: RequestState,
  formData: FormData
): Promise<RequestState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, logo_url, shareable_link_token, default_sms_template, default_email_template, default_email_subject")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) return { error: "Business not found." };

  const parsed = SendSchema.safeParse({
    contact_name: formData.get("contact_name") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    channel: formData.get("channel"),
  });

  if (!parsed.success) return { error: "Check your inputs." };
  const { contact_name, phone, email, channel } = parsed.data;

  if (channel === "sms" && !phone) return { error: "Phone number is required for SMS." };
  if (channel === "email" && !email) return { error: "Email address is required for email requests." };

  // Check subscription limits
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, sms_used_this_month, email_used_this_month, monthly_sms_limit, monthly_email_limit")
    .eq("business_id", business.id)
    .maybeSingle();

  if (sub) {
    const isTrialExpired = sub.status === "trialing" && new Date(sub.trial_ends_at) < new Date();
    const isCanceled = sub.status === "canceled";
    if (isTrialExpired || isCanceled) return { error: "Your subscription is inactive. Please upgrade to send requests." };

    if (channel === "sms" && sub.sms_used_this_month >= sub.monthly_sms_limit) {
      return { error: `Monthly SMS limit reached (${sub.monthly_sms_limit}). Upgrade your plan for more.` };
    }
    if (channel === "email" && sub.email_used_this_month >= sub.monthly_email_limit) {
      return { error: `Monthly email limit reached (${sub.monthly_email_limit}). Upgrade your plan for more.` };
    }
  }

  // Upsert contact
  let contactId: string | null = null;
  if (phone || email) {
    const { data: contact } = await supabase
      .from("contacts")
      .upsert(
        {
          business_id: business.id,
          name: contact_name ?? null,
          phone: phone ?? null,
          email: email ?? null,
          review_requested: true,
        },
        { onConflict: phone ? "business_id,phone" : "business_id,email", ignoreDuplicates: false }
      )
      .select("id")
      .maybeSingle();
    contactId = contact?.id ?? null;
  }

  // Create review request record
  const { data: reviewRequest, error: insertError } = await supabase
    .from("review_requests")
    .insert({
      business_id: business.id,
      contact_id: contactId,
      channel,
      status: "pending",
      contact_name: contact_name ?? null,
      contact_phone: phone ?? null,
      contact_email: email ?? null,
    })
    .select("id, token")
    .single();

  if (insertError || !reviewRequest) {
    return { error: "Failed to create request. Please try again." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const requestUrl = `${appUrl}/r/${reviewRequest.token}`;

  // Send via chosen channel
  try {
    if (channel === "sms") {
      const smsBody = business.default_sms_template
        ? business.default_sms_template.replace("{link}", requestUrl)
        : `Hi${contact_name ? ` ${contact_name.split(" ")[0]}` : ""}! How was your experience at ${business.name}? Tap here to let us know: ${requestUrl}`;

      const { sid } = await sendSms(phone!, smsBody);

      await supabase
        .from("review_requests")
        .update({ status: "sent", sent_at: new Date().toISOString(), twilio_message_sid: sid })
        .eq("id", reviewRequest.id);

      // Increment usage
      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ sms_used_this_month: sub.sms_used_this_month + 1 })
          .eq("business_id", business.id);
      }
    }

    if (channel === "email") {
      await sendReviewRequestEmail({
        to: email!,
        businessName: business.name,
        logoUrl: business.logo_url,
        requestUrl,
        subject: business.default_email_subject,
        customMessage: business.default_email_template,
      });

      await supabase
        .from("review_requests")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", reviewRequest.id);

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ email_used_this_month: sub.email_used_this_month + 1 })
          .eq("business_id", business.id);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Send failed";
    await supabase
      .from("review_requests")
      .update({ status: "failed", failure_reason: msg })
      .eq("id", reviewRequest.id);
    return { error: `Could not send ${channel}: ${msg}` };
  }

  revalidatePath("/generate");
  return {
    success: `Request sent via ${channel === "sms" ? "SMS" : "email"}.`,
    requestId: reviewRequest.id,
  };
}
