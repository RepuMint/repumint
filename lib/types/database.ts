// All Row/Insert/Update types must be `type` aliases (not `interface`) so they satisfy
// Record<string, unknown> in TypeScript's conditional type checks, which is required by
// Supabase's internal GenericSchema constraint.

export type BusinessCategory =
  | "restaurant" | "cafe" | "bar" | "salon" | "spa"
  | "barbershop" | "studio" | "gym" | "retail" | "other";

export type SubscriptionPlan = "trial" | "starter" | "pro" | "canceled";
export type SubscriptionStatus =
  | "trialing" | "active" | "past_due" | "canceled"
  | "unpaid" | "incomplete" | "incomplete_expired" | "paused";

export type Platform = "google" | "yelp" | "facebook" | "tripadvisor";
export type ReviewStatus = "unresponded" | "responded" | "flagged" | "ignored";
export type ReviewRequestChannel = "sms" | "email" | "qr" | "link";
export type ReviewRequestStatus =
  | "pending" | "sent" | "delivered" | "opened" | "clicked"
  | "reviewed" | "feedback_given" | "unsubscribed" | "failed";
export type CampaignType = "sms" | "email" | "qr" | "link";
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type FeedbackStatus = "new" | "read" | "in_progress" | "resolved" | "ignored";

// ============================================================
// Row types (must be `type`, not `interface`)
// ============================================================

export type BusinessRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  category: BusinessCategory | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  logo_url: string | null;
  google_place_id: string | null;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expires_at: string | null;
  yelp_business_id: string | null;
  yelp_url: string | null;
  facebook_page_id: string | null;
  facebook_access_token: string | null;
  facebook_token_expires_at: string | null;
  tripadvisor_location_id: string | null;
  tripadvisor_api_key: string | null;
  sentiment_filter_enabled: boolean;
  sentiment_threshold: number;
  review_request_delay_hours: number;
  default_sms_template: string | null;
  default_email_template: string | null;
  default_email_subject: string | null;
  shareable_link_token: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  business_id: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  monthly_sms_limit: number;
  monthly_email_limit: number;
  sms_used_this_month: number;
  email_used_this_month: number;
  usage_reset_at: string;
  created_at: string;
  updated_at: string;
};

export type ContactRow = {
  id: string;
  business_id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  tags: string[];
  last_visited_at: string | null;
  total_visits: number;
  review_requested: boolean;
  review_given: boolean;
  created_at: string;
  updated_at: string;
};

export type CampaignRow = {
  id: string;
  business_id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  message_template: string | null;
  subject_line: string | null;
  qr_code_url: string | null;
  qr_code_token: string | null;
  shareable_url: string | null;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  review_count: number;
  feedback_count: number;
  created_at: string;
  updated_at: string;
};

export type ReviewRequestRow = {
  id: string;
  business_id: string;
  contact_id: string | null;
  campaign_id: string | null;
  channel: ReviewRequestChannel;
  status: ReviewRequestStatus;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  sentiment_shown: boolean;
  sentiment_response: number | null;
  sentiment_shown_at: string | null;
  token: string;
  directed_to_platform: Platform | null;
  twilio_message_sid: string | null;
  resend_email_id: string | null;
  failure_reason: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewRow = {
  id: string;
  business_id: string;
  platform: Platform;
  external_id: string | null;
  reviewer_name: string | null;
  reviewer_avatar: string | null;
  rating: number;
  body: string | null;
  review_url: string | null;
  response_text: string | null;
  responded_at: string | null;
  responded_by: string | null;
  response_synced: boolean;
  status: ReviewStatus;
  raw_data: Record<string, unknown> | null;
  review_date: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FeedbackRow = {
  id: string;
  business_id: string;
  review_request_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  rating: number | null;
  body: string | null;
  status: FeedbackStatus;
  owner_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

// Convenience aliases
export type Business = BusinessRow;
export type Subscription = SubscriptionRow;
export type Contact = ContactRow;
export type Campaign = CampaignRow;
export type ReviewRequest = ReviewRequestRow;
export type Review = ReviewRow;
export type Feedback = FeedbackRow;

// ============================================================
// Database schema for Supabase client typing
// ============================================================

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: BusinessRow;
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          category?: BusinessCategory | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string;
          logo_url?: string | null;
          google_place_id?: string | null;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          google_token_expires_at?: string | null;
          yelp_business_id?: string | null;
          yelp_url?: string | null;
          facebook_page_id?: string | null;
          facebook_access_token?: string | null;
          facebook_token_expires_at?: string | null;
          tripadvisor_location_id?: string | null;
          tripadvisor_api_key?: string | null;
          sentiment_filter_enabled?: boolean;
          sentiment_threshold?: number;
          review_request_delay_hours?: number;
          default_sms_template?: string | null;
          default_email_template?: string | null;
          default_email_subject?: string | null;
          shareable_link_token?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          category?: BusinessCategory | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          country?: string;
          logo_url?: string | null;
          google_place_id?: string | null;
          google_access_token?: string | null;
          google_refresh_token?: string | null;
          google_token_expires_at?: string | null;
          yelp_business_id?: string | null;
          yelp_url?: string | null;
          facebook_page_id?: string | null;
          facebook_access_token?: string | null;
          facebook_token_expires_at?: string | null;
          tripadvisor_location_id?: string | null;
          tripadvisor_api_key?: string | null;
          sentiment_filter_enabled?: boolean;
          sentiment_threshold?: number;
          review_request_delay_hours?: number;
          default_sms_template?: string | null;
          default_email_template?: string | null;
          default_email_subject?: string | null;
          shareable_link_token?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: {
          id?: string;
          business_id: string;
          owner_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          trial_ends_at?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          monthly_sms_limit?: number;
          monthly_email_limit?: number;
          sms_used_this_month?: number;
          email_used_this_month?: number;
          usage_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          trial_ends_at?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          monthly_sms_limit?: number;
          monthly_email_limit?: number;
          sms_used_this_month?: number;
          email_used_this_month?: number;
          usage_reset_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: ContactRow;
        Insert: {
          id?: string;
          business_id: string;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          tags?: string[];
          last_visited_at?: string | null;
          total_visits?: number;
          review_requested?: boolean;
          review_given?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          tags?: string[];
          last_visited_at?: string | null;
          total_visits?: number;
          review_requested?: boolean;
          review_given?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: CampaignRow;
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          type: CampaignType;
          status?: CampaignStatus;
          message_template?: string | null;
          subject_line?: string | null;
          qr_code_url?: string | null;
          qr_code_token?: string | null;
          shareable_url?: string | null;
          sent_count?: number;
          opened_count?: number;
          clicked_count?: number;
          review_count?: number;
          feedback_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: CampaignType;
          status?: CampaignStatus;
          message_template?: string | null;
          subject_line?: string | null;
          qr_code_url?: string | null;
          qr_code_token?: string | null;
          shareable_url?: string | null;
          sent_count?: number;
          opened_count?: number;
          clicked_count?: number;
          review_count?: number;
          feedback_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      review_requests: {
        Row: ReviewRequestRow;
        Insert: {
          id?: string;
          business_id: string;
          contact_id?: string | null;
          campaign_id?: string | null;
          channel: ReviewRequestChannel;
          status?: ReviewRequestStatus;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          sentiment_shown?: boolean;
          sentiment_response?: number | null;
          sentiment_shown_at?: string | null;
          token?: string;
          directed_to_platform?: Platform | null;
          twilio_message_sid?: string | null;
          resend_email_id?: string | null;
          failure_reason?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: ReviewRequestStatus;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          sentiment_shown?: boolean;
          sentiment_response?: number | null;
          sentiment_shown_at?: string | null;
          directed_to_platform?: Platform | null;
          twilio_message_sid?: string | null;
          resend_email_id?: string | null;
          failure_reason?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          responded_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: {
          id?: string;
          business_id: string;
          platform: Platform;
          external_id?: string | null;
          reviewer_name?: string | null;
          reviewer_avatar?: string | null;
          rating: number;
          body?: string | null;
          review_url?: string | null;
          response_text?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          response_synced?: boolean;
          status?: ReviewStatus;
          raw_data?: Record<string, unknown> | null;
          review_date?: string | null;
          synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reviewer_name?: string | null;
          reviewer_avatar?: string | null;
          rating?: number;
          body?: string | null;
          review_url?: string | null;
          response_text?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          response_synced?: boolean;
          status?: ReviewStatus;
          raw_data?: Record<string, unknown> | null;
          review_date?: string | null;
          synced_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: FeedbackRow;
        Insert: {
          id?: string;
          business_id: string;
          review_request_id?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          rating?: number | null;
          body?: string | null;
          status?: FeedbackStatus;
          owner_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          rating?: number | null;
          body?: string | null;
          status?: FeedbackStatus;
          owner_notes?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      review_stats: {
        Row: {
          business_id: string;
          platform: Platform;
          total_reviews: number;
          avg_rating: number;
          unresponded_count: number;
          five_star_count: number;
          four_star_count: number;
          three_star_count: number;
          two_star_count: number;
          one_star_count: number;
          latest_review_date: string | null;
        };
        Relationships: [];
      };
      campaign_stats: {
        Row: {
          campaign_id: string;
          business_id: string;
          name: string;
          type: CampaignType;
          status: CampaignStatus;
          sent_count: number;
          opened_count: number;
          clicked_count: number;
          review_count: number;
          feedback_count: number;
          conversion_rate: number;
          open_rate: number;
        };
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
