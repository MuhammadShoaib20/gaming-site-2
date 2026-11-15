-- Rebrand: "Puzzle Walkthroughs" -> "LevelGuide" (levelguide.fun)
-- The INSERT ... ON CONFLICT DO NOTHING seeds in schema.sql / 20261012_pages_cms.sql
-- only apply to a brand-new database, so on a site that is already live we need an
-- explicit UPDATE to change the name and the About page content people already have.
--
-- Run this once against your existing Supabase project.

-- 1) Site name + canonical URL shown in the header, footer, and metadata.
--    Only touches the row if it still has the old default, so it won't clobber a
--    name you may have already changed yourself from the admin panel.
UPDATE public.settings
SET site_name = 'LevelGuide',
    site_url = 'https://levelguide.fun',
    updated_at = now()
WHERE id = 1
  AND (site_name IS NULL OR site_name IN ('Puzzle Walkthroughs', 'PuzzleWalkthroughs'))
  AND (site_url IS NULL OR site_url IN ('https://yoursite.com', 'https://puzzlewalkthroughs.com'));

-- 2) About page — states the site's real purpose: finding the hardest levels,
--    working out how to beat them, and sharing that as free, level-by-level
--    video walkthroughs. Edit any time from the admin Pages screen.
UPDATE public.pages
SET content = '<p>Welcome to LevelGuide — the place to come back to whenever a puzzle game level has you completely stuck.</p><p>Our aim is simple: we play through the hardest levels of popular puzzle games ourselves, work out exactly how to beat them, and turn that into clear video walkthroughs and step-by-step guides — level by level — so you are never stuck for long.</p><p>Every guide is free to use, quick to find, and focused on one thing: getting you unstuck and back to playing, without confusing text or long detours.</p>',
    meta_title = 'About Us',
    meta_description = 'Learn about LevelGuide — free, level-by-level video walkthroughs that help you beat the hardest puzzle game levels.',
    updated_at = now()
WHERE slug = 'about';

-- 3) Contact page — just the e-mail placeholder updated to the new domain.
UPDATE public.pages
SET content = '<p>Have questions, feedback, or business inquiries? Reach out to us:</p><p><strong>Email:</strong> contact@levelguide.fun</p>',
    meta_description = 'Get in touch with LevelGuide.',
    updated_at = now()
WHERE slug = 'contact';
