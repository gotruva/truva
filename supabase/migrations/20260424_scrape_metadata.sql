-- Tracks the last time the automated scraper ran a full deposit-banks check.
-- Populated by the scraping pipeline after each successful batch extract.
-- Read by the frontend to display an accurate "last checked" date.

CREATE TABLE IF NOT EXISTS public.scrape_metadata (
  key     text        PRIMARY KEY,
  ran_at  timestamptz NOT NULL
);
