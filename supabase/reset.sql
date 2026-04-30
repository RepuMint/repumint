-- ============================================================
-- RepuMint — Full reset. Drops everything and starts clean.
-- Run this FIRST in Supabase SQL Editor, then run schema.sql.
-- ============================================================

DROP VIEW  IF EXISTS campaign_stats   CASCADE;
DROP VIEW  IF EXISTS review_stats     CASCADE;

DROP TABLE IF EXISTS feedback         CASCADE;
DROP TABLE IF EXISTS reviews          CASCADE;
DROP TABLE IF EXISTS review_requests  CASCADE;
DROP TABLE IF EXISTS campaigns        CASCADE;
DROP TABLE IF EXISTS contacts         CASCADE;
DROP TABLE IF EXISTS subscriptions    CASCADE;
DROP TABLE IF EXISTS businesses       CASCADE;

DROP FUNCTION IF EXISTS set_updated_at CASCADE;
