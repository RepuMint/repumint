import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { FeedbackFormPage } from "@/components/public/feedback-form-page";

export default async function FeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ rating?: string }>;
}) {
  const { token } = await params;
  const { rating } = await searchParams;
  const supabase = await createServiceClient();

  // Look up the review request
  const { data: request } = await supabase
    .from("review_requests")
    .select("id, business_id, contact_name, contact_phone, contact_email")
    .eq("token", token)
    .maybeSingle();

  if (!request) notFound();

  const { data: business } = await supabase
    .from("businesses")
    .select("name, logo_url")
    .eq("id", request.business_id)
    .maybeSingle();

  if (!business) notFound();

  return (
    <FeedbackFormPage
      requestId={request.id}
      businessId={request.business_id}
      businessName={business.name}
      logoUrl={business.logo_url}
      contactName={request.contact_name}
      contactPhone={request.contact_phone}
      contactEmail={request.contact_email}
      initialRating={rating ? parseInt(rating, 10) : null}
    />
  );
}
