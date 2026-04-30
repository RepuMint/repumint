import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    amount: 2900,
    smsLimit: 50,
    emailLimit: 500,
    features: [
      "50 SMS review requests/mo",
      "500 email review requests/mo",
      "Happy path routing to Google, Yelp & Facebook",
      "Sentiment filter — unhappy customers stay private",
      "Instant notifications on private feedback",
      "QR codes & shareable review links",
      "Respond to reviews from the dashboard",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    amount: 3900,
    smsLimit: 200,
    emailLimit: 2000,
    features: [
      "200 SMS review requests/mo",
      "2,000 email review requests/mo",
      "Everything in Starter",
      "AI-suggested review responses",
      "Advanced analytics & review growth tracking",
      "Priority support",
    ],
  },
} as const;
