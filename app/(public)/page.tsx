import Link from 'next/link';
import { getAllGames, getLatestLevels, getLatestBlogs } from '@/lib/db';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/schema';
import NavbarSearch from '@/components/NavbarSearch';
import GameCard from '@/components/GameCard';
import BlogCard from '@/components/BlogCard';
import EmptyState from '@/components/EmptyState';
import JsonLd from '@/components/JsonLd';
import type { Level } from '@/types';
import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/'),
    languages: { en: '/' },
  },
};

type GameRef = { id: string; name: string; slug: string };

type LevelWithGame = Level & {
  game: GameRef | GameRef[];
};

// Decorative "level board" shown in the hero. Level 6 is the one you're stuck on.
const BOARD: { n: string; kind: '' | 'solved' | 'stuck' }[] = [
  { n: '1', kind: 'solved' },
  { n: '2', kind: 'solved' },
  { n: '3', kind: 'solved' },
  { n: '4', kind: 'solved' },
  { n: '5', kind: 'solved' },
  { n: '?', kind: 'stuck' },
  { n: '7', kind: '' },
  { n: '8', kind: '' },
  { n: '9', kind: '' },
  { n: '10', kind: '' },
  { n: '11', kind: '' },
  { n: '12', kind: '' },
  { n: '', kind: '' },
  { n: '', kind: '' },
  { n: '', kind: '' },
  { n: '', kind: '' },
];

function LevelLink({ level }: { level: LevelWithGame }) {
  const gameData = Array.isArray(level.game) ? level.game[0] : level.game;
  if (!gameData?.slug) return null;

  return (
    <Link
      href={`/game/${gameData.slug}/level-${level.level_number}`}
      prefetch={false}
      className="lv-link"
    >
      <span className="lv-num">{level.level_number}</span>
      <span className="lv-text">
        <span className="lv-title">{level.title || `Level ${level.level_number}`}</span>
        <span className="lv-game">{gameData.name}</span>
      </span>
    </Link>
  );
}

export default async function HomePage() {
  const [games, levels, blogs] = await Promise.all([
    getAllGames(),
    getLatestLevels(12),
    getLatestBlogs(3),
  ]);

  const totalLevels = games.reduce((sum, g) => sum + (g.total_levels || 0), 0);

  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <div className="home">
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />

      {/* ============= HERO ============= */}
      <section className="home-hero">
        <div className="home-hero-scene" aria-hidden="true">
          <span className="home-hero-orbit" />
          <span className="home-hero-tile home-hero-tile-one" />
          <span className="home-hero-tile home-hero-tile-two" />
          <span className="home-hero-tile home-hero-tile-three" />
        </div>
        <div className="container-page home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-kicker">Level-by-level video guides</span>
            <h2 className="home-title">
              <span className="home-title-line">Stuck on a level?</span>
              <span className="home-title-line">
                <span className="home-title-accent">Watch it click.</span>
              </span>
            </h2>
            <p className="home-lead">
              Find your game and jump to the exact level you&apos;re playing. Follow a clear,
              free video walkthrough, one move at a time—then get back to the fun.
            </p>

            <div className="home-search">
              <NavbarSearch big placeholder="Find a puzzle game…" />
            </div>

            <div className="home-actions">
              <Link href="#all-games" className="btn btn-primary btn-lg">
                Explore games
              </Link>
              <Link href="/blog" className="btn btn-secondary btn-lg">
                Watch walkthroughs
              </Link>
            </div>

            <div className="home-stats">
              <div className="home-stat">
                <b>{totalLevels}</b>
                <span>levels covered</span>
              </div>
              <div className="home-stat">
                <b>{games.length}</b>
                <span>{games.length === 1 ? 'game covered' : 'games covered'}</span>
              </div>
              <div className="home-stat">
                <b>100%</b>
                <span>free, no signup</span>
              </div>
            </div>
          </div>

          <div className="hero-video-card" aria-hidden="true">
            <span className="hvc-float-badge hvc-float-badge-top">
              {totalLevels > 0
                ? `✓ ${totalLevels.toLocaleString('en-US')} ${totalLevels === 1 ? 'level' : 'levels'} covered`
                : 'Free puzzle guides'}
            </span>

            <div className="hvc-thumb">
              <span className="hvc-live-pulse">
                <span className="hvc-live-dot" /> GUIDE
              </span>
              <span className="hvc-duration">STEP BY STEP</span>
              <button type="button" className="hvc-play" tabIndex={-1}>
                <span className="hvc-play-icon" />
              </button>
            </div>

            <div className="hvc-info">
              <span className="hvc-info-title">Level-by-level walkthrough</span>
              <span className="hvc-info-sub">LevelGuide · Free video guides</span>
            </div>

            <div className="hvc-strip">
              {BOARD.slice(0, 10).map((tile, i) => (
                <span
                  key={`hvc-chip-${i}`}
                  className={`hvc-chip ${tile.kind}`}
                >
                  {tile.n || i + 1}
                </span>
              ))}
            </div>

            <span className="hvc-float-badge hvc-float-badge-bottom">▶ Free to watch</span>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto text-center px-4 py-10">
        <h1 className="text-4xl font-bold mb-4">
          Free walkthroughs for the games you play
        </h1>
        <p className="text-lg text-gray-600">
          <strong>LevelGuide</strong> helps you find a clear route through tricky mobile puzzle
          levels. Browse the games available now, open a level, and follow its walkthrough. The
          catalog grows as new games and level guides are added.
        </p>
      </section>

      {/* ============= LATEST GAMES ============= */}
      <section id="all-games" className="container-page home-section">
        <div className="home-head">
          <div>
            <h2 className="home-h2">Latest games</h2>
            <p className="home-sub">
              {games.length} {games.length === 1 ? 'game' : 'games'} with level-by-level guides
            </p>
          </div>
          <Link href="/games" className="link-arrow">
            View all →
          </Link>
        </div>

        {games.length === 0 ? (
          <EmptyState
            emoji="🎮"
            title="No games added yet"
            text="Add games from the admin panel to see them here."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {games.slice(0, 4).map((game, idx) => (
              <GameCard key={game.id} game={game} index={idx} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 mt-12 bg-gray-50 rounded-2xl">
        <div className="prose prose-lg max-w-none text-gray-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why use LevelGuide?
          </h2>
          <p>
            When a puzzle level has you stuck, open the matching game and level page to see the
            walkthroughs available. Follow the key moves, understand the solution, and get back to
            playing at your own pace.
          </p>
          <p>
            Guides are free to access without a signup. The catalog is updated as new games and
            level walkthroughs are added.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Frequently Asked Questions
          </h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            Are your walkthroughs free?
          </h3>
          <p>Yes, all of our level walkthroughs, tips, and strategies are 100% free to access.</p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            How many games do you cover?
          </h3>
          <p>
            {games.length === 0
              ? 'There are no games listed yet.'
              : `There ${games.length === 1 ? 'is' : 'are'} ${games.length} ${games.length === 1 ? 'game' : 'games'} listed right now.`}{' '}
            This count updates as games are added.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            Do you provide video solutions?
          </h3>
          <p>
            Video walkthroughs and step-by-step solutions are shown on the level pages where they
            are available.
          </p>
        </div>
      </section>

      {/* ============= LATEST LEVELS ============= */}
      {levels.length > 0 && (
        <section className="container-page home-section home-lazy">
          <div className="home-head">
            <div>
              <h2 className="home-h2">Latest levels</h2>
              <p className="home-sub">Fresh walkthroughs added recently</p>
            </div>
          </div>

          <div className="lv-grid">
            {(levels as LevelWithGame[]).map((level) => (
              <LevelLink key={level.id} level={level} />
            ))}
          </div>
        </section>
      )}

      {/* ============= LATEST BLOGS ============= */}
      {blogs.length > 0 && (
        <section className="container-page home-section home-lazy">
          <div className="home-head">
            <div>
              <h2 className="home-h2">Latest guides</h2>
              <p className="home-sub">Tips, tricks and walkthrough articles</p>
            </div>
            <Link href="/blog" className="link-arrow">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} preload={index < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ============= CTA ============= */}
      <section className="container-page home-section home-lazy home-section-last">
        <div className="home-cta">
          <div>
            <h2>Can&apos;t find your game?</h2>
            <p>Tell us which puzzle game you&apos;re stuck on and we&apos;ll add its walkthrough.</p>
          </div>
          <Link href="/contact" className="btn btn-accent btn-lg">
            Request a game
          </Link>
        </div>
      </section>
    </div>
  );
}
