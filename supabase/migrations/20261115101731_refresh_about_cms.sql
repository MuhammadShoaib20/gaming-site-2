INSERT INTO public.pages (
  slug,
  title,
  content,
  meta_title,
  meta_description,
  is_published,
  show_in_footer,
  sort_order
)
VALUES
  (
    'about',
    'About us',
    '<h2>Welcome to LevelGuide</h2><p>When a puzzle level stops your progress, a clear walkthrough can help you find the next move. LevelGuide brings game and level guides together in one place, so you can get help without digging through unrelated tips.</p><h2>What you can find here</h2><ul><li><strong>Game pages:</strong> Browse the puzzle games currently in the catalog.</li><li><strong>Level walkthroughs:</strong> Find video and written guidance for levels where it is available.</li><li><strong>Practical hints:</strong> Review helpful steps and tips at your own pace.</li><li><strong>Free access:</strong> Guides are available without a signup.</li></ul><h2>A catalog that grows with players</h2><p>The games and levels listed on LevelGuide reflect the current catalog. More are added as new walkthroughs are ready, so availability can change over time.</p><p><a href="/games">Browse the games currently listed</a> to see what is available now.</p><h2>Our approach</h2><p>We aim to make puzzle guidance clear, focused, and easy to use. Each guide is tied to a game or level, so you can go straight to the help you need.</p><h2>Suggest a game or get in touch</h2><p>If a game or level is missing, let us know through our <a href="/contact">contact page</a>. Suggestions help shape what we add next.</p>',
    'About LevelGuide | Puzzle Game Walkthroughs',
    'Learn how LevelGuide helps players find free walkthroughs for the games and levels currently in its catalog.',
    true,
    true,
    1
  ),
  (
    'contact',
    'Contact us',
    '<h2>Get in touch</h2><p>Have a question, found something that needs correcting, or want to suggest a puzzle game for the catalog? We would like to hear from you.</p><p><strong>Email:</strong> <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a></p><p>For a game suggestion, include its name and the level you would like us to cover. We add games and guides as they become available.</p>',
    'Contact LevelGuide',
    'Contact LevelGuide with questions, feedback, corrections, or puzzle game suggestions.',
    true,
    true,
    2
  ),
  (
    'privacy',
    'Privacy policy',
    '<p><strong>Last updated:</strong> November 15, 2026</p><p>LevelGuide is operated by MS Digital System. This page explains the site technologies that may process information when you visit.</p><h2>Consent preference</h2><p>Your cookie choice is saved in local storage on your device so the site can remember it.</p><h2>Analytics</h2><p>If you accept cookies and Google Analytics is configured, this site loads Google Analytics to measure usage. Google may process information such as pages viewed and browser or device details under its own privacy policy. Rejecting consent keeps this site from loading Google Analytics.</p><h2>Advertising and embedded content</h2><p>The site may load Google AdSense ads and embed YouTube videos. These providers may use cookies or similar technologies and process technical information according to their own privacy policies and settings.</p><h2>Your choices</h2><p>Choose Accept or Reject in the cookie banner to set your Google Analytics preference. You can reopen the banner using Cookie Settings in the footer. Browser settings can also be used to manage cookies. Advertising and embedded services may use their own technologies.</p><h2>Contact</h2><p>For privacy questions, email <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a>.</p>',
    'Privacy Policy | LevelGuide',
    'Learn how LevelGuide handles cookie preferences, analytics, advertising, and embedded video services.',
    true,
    true,
    3
  ),
  (
    'terms',
    'Terms of service',
    '<p><strong>Last updated:</strong> November 15, 2026</p><p>These terms apply when you use LevelGuide. By using the site, you agree to use it lawfully and respectfully.</p><h2>Guides and information</h2><p>Walkthroughs, videos, and tips are provided for general informational help. Games can change, so a solution may differ between versions. We cannot guarantee that every guide will always be available or work for every player.</p><h2>Third-party services</h2><p>The site may link to or embed services such as YouTube. Those services have their own terms and privacy policies, which apply when you use them.</p><h2>Using site content</h2><p>Please do not republish or redistribute LevelGuide content without permission, except where applicable law allows it.</p><h2>Changes and availability</h2><p>We may update the site, its guides, or these terms as the catalog changes. Continued use of the site after an update means you accept the current terms.</p><h2>Contact</h2><p>Questions about these terms? Email <a href="mailto:contact@levelguide.fun">contact@levelguide.fun</a>.</p>',
    'Terms of Service | LevelGuide',
    'Terms for using LevelGuide puzzle walkthroughs, videos, and game guides.',
    true,
    true,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  show_in_footer = EXCLUDED.show_in_footer,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
