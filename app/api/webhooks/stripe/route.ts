import { stripe, PLANS } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types/database";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const businessId = session.metadata?.business_id;
        const ownerId = session.metadata?.owner_id;
        if (!businessId || !ownerId) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await upsertSubscription(supabase, subscription, businessId, ownerId);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("business_id, owner_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (existing) {
          await upsertSubscription(
            supabase,
            subscription,
            existing.business_id,
            existing.owner_id
          );
        } else {
          // Look up by customer ID
          const { data: byCustomer } = await supabase
            .from("subscriptions")
            .select("business_id, owner_id")
            .eq("stripe_customer_id", subscription.customer as string)
            .maybeSingle();

          if (byCustomer) {
            await upsertSubscription(
              supabase,
              subscription,
              byCustomer.business_id,
              byCustomer.owner_id
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ plan: "canceled", status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Reset monthly usage counters on successful renewal
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            sms_used_this_month: 0,
            email_used_this_month: 0,
            usage_reset_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function upsertSubscription(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  subscription: Stripe.Subscription,
  businessId: string,
  ownerId: string
) {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const plan = resolvePlan(priceId);
  const status = subscription.status as SubscriptionStatus;
  const limits = plan === "starter" ? PLANS.starter : PLANS.pro;

  // In Stripe v22 the billing period lives on the subscription item
  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000).toISOString()
    : null;
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  await supabase.from("subscriptions").upsert(
    {
      business_id: businessId,
      owner_id: ownerId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan,
      status,
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : new Date().toISOString(),
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      monthly_sms_limit: limits.smsLimit,
      monthly_email_limit: limits.emailLimit,
    },
    { onConflict: "business_id" }
  );
}

function resolvePlan(priceId: string | undefined): SubscriptionPlan {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  return "starter";
}
