-- Puzzle Site database baseline snapshot
-- Captured: 2026-10-09
-- Restore only into a new/empty Supabase project after reviewing project-specific policies.
-- Existing production projects should use incremental migrations instead.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_image text,
  short_description text,
  full_description text,
  walkthrough_intro text,
  youtube_trailer_url text,
  youtube_channel_url text,
  custom_buttons jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords text[],
  operating_system text NOT NULL DEFAULT 'Android, iOS',
  total_levels integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  level_number integer NOT NULL,
  title text,
  slug text,
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  description text,
  walkthrough text,
  tips text,
  meta_title text,
  meta_description text,
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT levels_game_level_unique UNIQUE (game_id, level_number)
);

CREATE OR REPLACE FUNCTION public.set_level_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS levels_set_updated_at ON public.levels;
CREATE TRIGGER levels_set_updated_at
  BEFORE UPDATE ON public.levels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_level_updated_at();

CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES public.games(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords text[],
  views integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  author text NOT NULL DEFAULT 'MS Digital System',
  published_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  show_in_footer boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Kept for compatibility with any legacy game links already in the database.
CREATE TABLE IF NOT EXISTS public.game_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  icon text,
  position integer NOT NULL DEFAULT 0,
  new_tab boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name text NOT NULL DEFAULT 'LevelGuide',
  site_url text NOT NULL DEFAULT 'https://levelguide.fun',
  site_logo text,
  site_description text,
  adsense_header text,
  adsense_in_article text,
  adsense_sidebar text,
  adsense_footer text,
  adsense_ads_txt text,
  youtube_button_text text NOT NULL DEFAULT 'Watch on YouTube',
  switch_youtube_enabled boolean NOT NULL DEFAULT true,
  google_analytics_id text,
  ahrefs_data_key text,
  google_search_console text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bing_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  api_key_encrypted text NOT NULL,
  site_url text NOT NULL,
  status text NOT NULL DEFAULT 'verification_failed'
    CHECK (status IN ('connected', 'verification_failed')),
  last_submitted_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_games_published_created ON public.games (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games (category_id);
CREATE INDEX IF NOT EXISTS idx_levels_game_number ON public.levels (game_id, level_number);
CREATE INDEX IF NOT EXISTS idx_levels_published_created ON public.levels (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_published_created ON public.blogs (published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_game ON public.blogs (game_id);
CREATE INDEX IF NOT EXISTS idx_pages_footer_order ON public.pages (is_published, show_in_footer, sort_order);
CREATE INDEX IF NOT EXISTS idx_game_links_game_position ON public.game_links (game_id, position);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);

INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.pages (
  slug, title, content, meta_title, meta_description,
  is_published, show_in_footer, sort_order
)
VALUES
  ('about', 'About us', '<h2>Welcome to LevelGuide</h2><p>When a puzzle level stops your progress, a clear walkthrough can help you find the next move. LevelGuide brings game and level guides together in one place, so you can get help without digging through unrelated tips.</p><h2>What you can find here</h2><ul><li><strong>Game pages:</strong> Browse the puzzle games currently in the catalog.</li><li><strong>Level walkthroughs:</strong> Find video and written guidance for levels where it is available.</li><li><strong>Practical hints:</strong> Review helpful steps and tips at your own pace.</li><li><strong>Free access:</strong> Guides are available without a signup.</li></ul><h2>A catalog that grows with players</h2><p>The games and levels listed on LevelGuide reflect the current catalog. More are added as new walkthroughs are ready, so availability can change over time.</p><p><a href="/games">Browse the games currently listed</a> to see what is available now.</p><h2>Our approach</h2><p>We aim to make puzzle guidance clear, focused, and easy to use. Each guide is tied to a game or level, so you can go straight to the help you need.</p><h2>Suggest a game or get in touch</h2><p>If a game or level is missing, let us know through our <a href="/contact">contact page</a>. Suggestions help shape what we add next.</p>', 'About LevelGuide | Puzzle Game Walkthroughs', 'Learn how LevelGuide helps players find free walkthroughs for the games and levels currently in its catalog.', true, true, 1),
  ('contact', 'Contact us', '<h2>Get in touch</h2><p>Have a question, found something that needs correcting, or want to suggest a puzzle game for the catalog? We would like to hear from you.</p><p><strong>Email:</strong> <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a></p><p>For a game suggestion, include its name and the level you would like us to cover. We add games and guides as they become available.</p>', 'Contact LevelGuide', 'Contact LevelGuide with questions, feedback, corrections, or puzzle game suggestions.', true, true, 2),
  ('privacy', 'Privacy policy', '<p><strong>Last updated:</strong> November 15, 2026</p><p>LevelGuide is operated by MS Digital System. This page explains the site technologies that may process information when you visit.</p><h2>Consent preference</h2><p>Your cookie choice is saved in local storage on your device so the site can remember it.</p><h2>Analytics</h2><p>If you accept cookies and Google Analytics is configured, this site loads Google Analytics to measure usage. Google may process information such as pages viewed and browser or device details under its own privacy policy. Rejecting consent keeps this site from loading Google Analytics.</p><h2>Advertising and embedded content</h2><p>The site may load Google AdSense ads and embed YouTube videos. These providers may use cookies or similar technologies and process technical information according to their own privacy policies and settings.</p><h2>Your choices</h2><p>Choose Accept or Reject in the cookie banner to set your Google Analytics preference. You can reopen the banner using Cookie Settings in the footer. Browser settings can also be used to manage cookies. Advertising and embedded services may use their own technologies.</p><h2>Contact</h2><p>For privacy questions, email <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a>.</p>', 'Privacy Policy | LevelGuide', 'Learn how LevelGuide handles cookie preferences, analytics, advertising, and embedded video services.', true, true, 3),
  ('terms', 'Terms of service', '<p><strong>Last updated:</strong> November 15, 2026</p><p>These terms apply when you use LevelGuide. By using the site, you agree to use it lawfully and respectfully.</p><h2>Guides and information</h2><p>Walkthroughs, videos, and tips are provided for general informational help. Games can change, so a solution may differ between versions. We cannot guarantee that every guide will always be available or work for every player.</p><h2>Third-party services</h2><p>The site may link to or embed services such as YouTube. Those services have their own terms and privacy policies, which apply when you use them.</p><h2>Using site content</h2><p>Please do not republish or redistribute LevelGuide content without permission, except where applicable law allows it.</p><h2>Changes and availability</h2><p>We may update the site, its guides, or these terms as the catalog changes. Continued use of the site after an update means you accept the current terms.</p><h2>Contact</h2><p>Questions about these terms? Email <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a>.</p>', 'Terms of Service | LevelGuide', 'Terms for using LevelGuide puzzle walkthroughs, videos, and game guides.', true, true, 4)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bing_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.bing_credentials TO service_role;

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read games" ON public.games;
CREATE POLICY "Public read games" ON public.games FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read levels" ON public.levels;
CREATE POLICY "Public read levels" ON public.levels FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read blogs" ON public.blogs;
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Public read published pages" ON public.pages;
CREATE POLICY "Public read published pages" ON public.pages FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Public read links" ON public.game_links;
CREATE POLICY "Public read links" ON public.game_links FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
-- Intentionally no anon/authenticated policy for admin_users.

GRANT SELECT ON public.pages TO anon, authenticated;
GRANT ALL ON public.pages TO service_role;
