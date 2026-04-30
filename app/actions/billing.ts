"use server";

import { redirect } from "next/navigation";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

async function getBusinessAndUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/onboarding");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, plan, status")
    .eq("business_id", business.id)
    .maybeSingle();

  return { user, business, subscription, supabase };
}

export async function createCheckoutSession(plan: "starter" | "pro") {
  const { user, business, subscription } = await getBusinessAndUser();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const priceId = PLANS[plan].priceId;

  // Reuse existing Stripe customer if one exists
  let customerId = subscription?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: business.name,
      metadata: { business_id: business.id, owner_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { business_id: business.id, owner_id: user.id },
    },
    metadata: { business_id: business.id, owner_id: user.id },
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const { subscription } = await getBusinessAndUser();

  if (!subscription?.stripe_customer_id) redirect("/billing");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  });

  redirect(session.url);
}
