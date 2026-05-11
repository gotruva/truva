-- Banking landing PMF funnel events
-- Captures user behavior on /banking to measure product-market fit
-- for the guided recommendation vs. browsable list experiment.

CREATE TABLE IF NOT EXISTS public.banking_landing_events (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type    text        NOT NULL,                  -- landing_view, form_started, form_completed, recommendation_view, recommendation_apply_click, list_scrolled, list_apply_click, faq_opened, skip_to_list_click
  page_view_id  text,                                  -- matches affiliate_impressions / affiliate_clicks
  page_path     text,
  horizon       text,                                  -- anytime | short | year | long
  liquidity     text,                                  -- flexible | lockable
  amount        numeric,
  question_id   integer,                               -- for faq_opened: 1-indexed question number
  placement     text,                                  -- for apply clicks: placement name
  created_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.banking_landing_events ENABLE ROW LEVEL SECURITY;

-- Anonymous (client-side) and authenticated users can insert — mirrors affiliate_impressions pattern
CREATE POLICY "anon_insert_banking_events"
  ON public.banking_landing_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Index for KPI queries: funnel analysis by event type + date
CREATE INDEX IF NOT EXISTS banking_landing_events_event_type_idx
  ON public.banking_landing_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS banking_landing_events_page_view_idx
  ON public.banking_landing_events (page_view_id);
