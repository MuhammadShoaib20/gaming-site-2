import type { Metadata, Viewport } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import DelayedAdSense from '@/components/DelayedAdSense';
import ConsentAnalytics from '@/components/ConsentAnalytics';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { getSettings } from '@/lib/db';
import { CANONICAL_SITE_URL } from '@/lib/seo';
import './globals.css';

const body = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  preload: false,
});

const display = Manrope({
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://levelguide.fun'),
  title: {
    default: 'Level Guide — Puzzle Game Walkthroughs',
    template: '%s | Level Guide',
  },
  description:
    'Level Guide helps you solve puzzle games with free level-by-level walkthroughs, video guides, and step-by-step solutions.',
  keywords: [
    'puzzle walkthrough',
    'puzzle games',
    'game guide',
    'level solutions',
    'puzzle tips',
  ],
  authors: [{ name: 'Level Guide' }],
  creator: 'Level Guide',
  publisher: 'Level Guide',
  alternates: {
    canonical: '/',
    languages: { en: '/' },
  },
  other: {
    'google-adsense-account': 'ca-pub-2631095859749439',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: CANONICAL_SITE_URL,
    siteName: 'Level Guide',
    title: 'Level Guide — Puzzle Game Walkthroughs',
    description:
      'Solve puzzle games with free level-by-level walkthroughs, video guides, and step-by-step solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Level Guide',
    description:
      'Solve puzzle games with free level-by-level walkthroughs, video guides, and step-by-step solutions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: '#0284C7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const ahrefsDataKey = settings?.ahrefs_data_key?.trim();

  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head>
        {ahrefsDataKey && (
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key={ahrefsDataKey}
            async
          />
        )}
      </head>
      <body>
        <DelayedAdSense />
        <ConsentAnalytics gaId={settings?.google_analytics_id || null} />
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
