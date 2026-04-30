-- ============================================================
-- RepuMint Database Schema
-- Run this entire file in the Supabase SQL editor.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLE: businesses
-- One business per owner (single-location SMB model)
-- ============================================================

CREATE TABLE businesses (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core identity
  name                        TEXT NOT NULL,
  slug                        TEXT UNIQUE NOT NULL,
  category                    TEXT CHECK (category IN ('restaurant', 'cafe', 'bar', 'salon', 'spa', 'barbershop', 'studio', 'gym', 'retail', 'other')),
  phone                       TEXT,
  email                       TEXT,
  website                     TEXT,

  -- Location
  address                     TEXT,
  city                        TEXT,
  state                       TEXT,
  zip                         TEXT,
  country                     TEXT DEFAULT 'US',

  -- Branding
  logo_url                    TEXT,

  -- Platform connections (Google)
  google_place_id             TEXT,
  google_access_token         TEXT,
  google_refresh_token        TEXT,
  google_token_expires_at     TIMESTAMPTZ,

  -- Platform connections (Yelp)
  yelp_business_id            TEXT,
  yelp_api_key                TEXT,

  -- Platform connections (Facebook)
  facebook_page_id            TEXT,
  facebook_access_token       TEXT,
  facebook_token_expires_at   TIMESTAMPTZ,

  -- Platform connections (TripAdvisor)
  tripadvisor_location_id     TEXT,
  tripadvisor_api_key         TEXT,

  -- Review request settings
  sentiment_filter_enabled    BOOLEAN NOT NULL DEFAULT true,
  -- Stars below this threshold route to private feedback instead of public review platforms
  sentiment_threshold         INTEGER NOT NULL DEFAULT 4 CHECK (sentiment_threshold BETWEEN 1 AND 5),
  review_request_delay_hours  INTEGER NOT NULL DEFAULT 0,
  default_sms_template        TEXT,
  default_email_template      TEXT,
  default_email_subject       TEXT,

  -- Shareable review link (permanent, tied to business)
  shareable_link_token        TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),

  -- Setup progress
  onboarding_completed        BOOLEAN NOT NULL DEFAULT false,
  onboarding_step             INTEGER NOT NULL DEFAULT 1,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_shareable_link_token ON businesses(shareable_link_token);

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: subscriptions
-- One subscription per business, Stripe-backed
-- ============================================================

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
  owner_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,

  plan                    TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'canceled')),
  status                  TEXT NOT NULL DEFAULT 'trialing' CHECK (
    status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')
  ),

  trial_ends_at           TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,

  -- Limits per plan
  monthly_sms_limit       INTEGER NOT NULL DEFAULT 50,   -- starter: 50, pro: 200
  monthly_email_limit     INTEGER NOT NULL DEFAULT 500,  -- starter: 500, pro: 2000
  sms_used_this_month     INTEGER NOT NULL DEFAULT 0,
  email_used_this_month   INTEGER NOT NULL DEFAULT 0,
  usage_reset_at          TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + INTERVAL '1 month',

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_owner_id ON subscriptions(owner_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: contacts
-- Customers of the business — used for review requests
-- ============================================================

CREATE TABLE contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  name         TEXT,
  phone        TEXT,
  email        TEXT,
  notes        TEXT,
  tags         TEXT[] DEFAULT '{}',

  -- Engagement tracking
  last_visited_at   TIMESTAMPTZ,
  total_visits      INTEGER NOT NULL DEFAULT 0,
  review_requested  BOOLEAN NOT NULL DEFAULT false,
  review_given      BOOLEAN NOT NULL DEFAULT false,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow multiple NULLs but enforce uniqueness when a value is present
CREATE UNIQUE INDEX idx_contacts_business_phone ON contacts(business_id, phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX idx_contacts_business_email ON contacts(business_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_business_id ON contacts(business_id);
CREATE INDEX idx_contacts_created_at ON contacts(business_id, created_at DESC);

CREATE TRIGGER trg_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: campaigns
-- A campaign is a collection of review requests sent via one channel
-- ============================================================

CREATE TABLE campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('sms', 'email', 'qr', 'link')),
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- Content
  message_template  TEXT,
  subject_line      TEXT,

  -- QR / shareable link
  qr_code_url       TEXT,
  qr_code_token     TEXT UNIQUE DEFAULT encode(gen_random_bytes(10), 'hex'),
  shareable_url     TEXT,

  -- Aggregated stats (denormalized for fast reads)
  sent_count        INTEGER NOT NULL DEFAULT 0,
  opened_count      INTEGER NOT NULL DEFAULT 0,
  clicked_count     INTEGER NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,
  feedback_count    INTEGER NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_qr_code_token ON campaigns(qr_code_token);
CREATE INDEX idx_campaigns_status ON campaigns(business_id, status);

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: review_requests
-- Individual outreach to a contact via SMS, email, QR, or link
-- ============================================================

CREATE TABLE review_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id    UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_id     UUID REFERENCES contacts(id) ON DELETE SET NULL,
  campaign_id    UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  channel        TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'qr', 'link')),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'reviewed', 'feedback_given', 'unsubscribed', 'failed')
  ),

  -- Snapshot of contact at time of send
  contact_name   TEXT,
  contact_phone  TEXT,
  contact_email  TEXT,

  -- Sentiment filter interaction
  sentiment_shown      BOOLEAN NOT NULL DEFAULT false,
  sentiment_response   INTEGER CHECK (sentiment_response BETWEEN 1 AND 5),
  sentiment_shown_at   TIMESTAMPTZ,

  -- Tracking token (used in URLs for open/click tracking)
  token          TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Platform the user was directed to after sentiment filter passed
  directed_to_platform  TEXT CHECK (directed_to_platform IN ('google', 'yelp', 'facebook', 'tripadvisor')),

  -- Delivery metadata
  twilio_message_sid    TEXT,
  resend_email_id       TEXT,
  failure_reason        TEXT,

  -- Timestamps
  sent_at        TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  opened_at      TIMESTAMPTZ,
  clicked_at     TIMESTAMPTZ,
  responded_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_requests_business_id ON review_requests(business_id);
CREATE INDEX idx_review_requests_contact_id ON review_requests(contact_id);
CREATE INDEX idx_review_requests_campaign_id ON review_requests(campaign_id);
CREATE INDEX idx_review_requests_token ON review_requests(token);
CREATE INDEX idx_review_requests_status ON review_requests(business_id, status);
CREATE INDEX idx_review_requests_created_at ON review_requests(business_id, created_at DESC);

CREATE TRIGGER trg_review_requests_updated_at
  BEFORE UPDATE ON review_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: reviews
-- Aggregated reviews from Google, Yelp, Facebook, TripAdvisor
-- Also used for internally captured QR/link reviews
-- ============================================================

CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  platform          TEXT NOT NULL CHECK (platform IN ('google', 'yelp', 'facebook', 'tripadvisor')),
  external_id       TEXT, -- platform's native review ID

  reviewer_name     TEXT,
  reviewer_avatar   TEXT,
  rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body              TEXT,
  review_url        TEXT,

  -- Response tracking
  response_text     TEXT,
  responded_at      TIMESTAMPTZ,
  responded_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  response_synced   BOOLEAN NOT NULL DEFAULT false, -- whether response was pushed back to platform

  -- Workflow state
  status            TEXT NOT NULL DEFAULT 'unresponded' CHECK (
    status IN ('unresponded', 'responded', 'flagged', 'ignored')
  ),

  -- Raw API payload for debugging / re-parsing
  raw_data          JSONB,

  review_date       TIMESTAMPTZ,
  synced_at         TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (business_id, platform, external_id)
);

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_platform ON reviews(business_id, platform);
CREATE INDEX idx_reviews_status ON reviews(business_id, status);
CREATE INDEX idx_reviews_rating ON reviews(business_id, rating);
CREATE INDEX idx_reviews_review_date ON reviews(business_id, review_date DESC);

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- TABLE: feedback
-- Private feedback captured by the sentiment filter
-- Unhappy customers land here instead of public platforms
-- ============================================================

CREATE TABLE feedback (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  review_request_id   UUID REFERENCES review_requests(id) ON DELETE SET NULL,

  contact_name        TEXT,
  contact_phone       TEXT,
  contact_email       TEXT,
  rating              INTEGER CHECK (rating BETWEEN 1 AND 5),
  body                TEXT,

  -- Owner workflow
  status              TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'ignored')),
  owner_notes         TEXT,
  resolved_at         TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_business_id ON feedback(business_id);
CREATE INDEX idx_feedback_status ON feedback(business_id, status);
CREATE INDEX idx_feedback_created_at ON feedback(business_id, created_at DESC);

CREATE TRIGGER trg_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- All tables locked down: owners only see their own data.
-- The service_role key (server-side only) bypasses RLS.
-- ============================================================

ALTER TABLE businesses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback        ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- BUSINESSES
-- -------------------------------------------------------

CREATE POLICY "owners can read own business"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "owners can insert own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners can update own business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners can delete own business"
  ON businesses FOR DELETE
  USING (owner_id = auth.uid());

-- -------------------------------------------------------
-- SUBSCRIPTIONS
-- -------------------------------------------------------

CREATE POLICY "owners can read own subscription"
  ON subscriptions FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "owners can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "owners can update own subscription"
  ON subscriptions FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- -------------------------------------------------------
-- CONTACTS — scoped through business ownership
-- -------------------------------------------------------

CREATE POLICY "owners can read own contacts"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert contacts for own business"
  ON contacts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can update own contacts"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can delete own contacts"
  ON contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = contacts.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- CAMPAIGNS
-- -------------------------------------------------------

CREATE POLICY "owners can read own campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert campaigns for own business"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can update own campaigns"
  ON campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can delete own campaigns"
  ON campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- REVIEW REQUESTS
-- -------------------------------------------------------

CREATE POLICY "owners can read own review requests"
  ON review_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = review_requests.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert review requests for own business"
  ON review_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = review_requests.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can update own review requests"
  ON review_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = review_requests.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = review_requests.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Review request public tracking policy:
-- Unauthenticated users can update their own request status via token
-- (opened, clicked, sentiment response) — needed for tracking URLs
CREATE POLICY "public tracking via token"
  ON review_requests FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Only allow updating specific tracking columns, not the whole row.
    -- Full column restriction enforced at the API/function level; this policy
    -- just allows the update to pass RLS when token is present in URL.
    token IS NOT NULL
  );

-- -------------------------------------------------------
-- REVIEWS
-- -------------------------------------------------------

CREATE POLICY "owners can read own reviews"
  ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert reviews for own business"
  ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can update own reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can delete own reviews"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- FEEDBACK
-- -------------------------------------------------------

CREATE POLICY "owners can read own feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedback.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert feedback for own business"
  ON feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedback.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can update own feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedback.business_id
        AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = feedback.business_id
        AND businesses.owner_id = auth.uid()
    )
  );

-- Public feedback submission policy:
-- Unauthenticated users (customers) can INSERT feedback via the sentiment filter flow.
-- The business_id is validated server-side before insert.
CREATE POLICY "public can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- ANALYTICS VIEWS (read-only, no RLS needed — queries go
-- through tables that already have RLS)
-- ============================================================

CREATE OR REPLACE VIEW review_stats AS
SELECT
  r.business_id,
  r.platform,
  COUNT(*)                                          AS total_reviews,
  ROUND(AVG(r.rating)::numeric, 1)                 AS avg_rating,
  COUNT(*) FILTER (WHERE r.status = 'unresponded') AS unresponded_count,
  COUNT(*) FILTER (WHERE r.rating = 5)             AS five_star_count,
  COUNT(*) FILTER (WHERE r.rating = 4)             AS four_star_count,
  COUNT(*) FILTER (WHERE r.rating = 3)             AS three_star_count,
  COUNT(*) FILTER (WHERE r.rating = 2)             AS two_star_count,
  COUNT(*) FILTER (WHERE r.rating = 1)             AS one_star_count,
  MAX(r.review_date)                               AS latest_review_date
FROM reviews r
GROUP BY r.business_id, r.platform;

CREATE OR REPLACE VIEW campaign_stats AS
SELECT
  c.id                                      AS campaign_id,
  c.business_id,
  c.name,
  c.type,
  c.status,
  c.sent_count,
  c.opened_count,
  c.clicked_count,
  c.review_count,
  c.feedback_count,
  CASE WHEN c.sent_count > 0
    THEN ROUND((c.review_count::numeric / c.sent_count) * 100, 1)
    ELSE 0
  END                                       AS conversion_rate,
  CASE WHEN c.sent_count > 0
    THEN ROUND((c.opened_count::numeric / c.sent_count) * 100, 1)
    ELSE 0
  END                                       AS open_rate
FROM campaigns c;
