import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { draftMode } from 'next/headers'

import { AnnouncementRibbon } from '@/components/site/AnnouncementBanner'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { HideOnHome } from '@/components/site/HideOnHome'
import { LivePreviewListener } from '@/components/site/LivePreviewListener'
import { PreviewBanner } from '@/components/site/PreviewBanner'
import { getAnnouncementBanner, getMassSchedule, getSiteSettings } from '@/lib/queries'
import { getServerSideURL } from '@/lib/url'

import '@/styles/global.css'

// Cinzel: inscriptional capitals for labels and buttons. Cormorant Garamond:
// headings. EB Garamond: body text. Served from src/fonts (SIL Open Font
// License) rather than fetched from Google Fonts at build time, which can fail.
const caps = localFont({
  src: [{ path: '../../fonts/cinzel.woff2', weight: '500 600', style: 'normal' }],
  variable: '--font-caps',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

const serif = localFont({
  src: [
    { path: '../../fonts/cormorant-garamond.woff2', weight: '500 600', style: 'normal' },
    { path: '../../fonts/cormorant-garamond-italic.woff2', weight: '500 600', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

const body = localFont({
  src: [
    { path: '../../fonts/eb-garamond.woff2', weight: '400 600', style: 'normal' },
    { path: '../../fonts/eb-garamond-italic.woff2', weight: '400 600', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Our Lady of the Blessed Sacrament · SSPX Cape Town',
    template: '%s · SSPX Cape Town',
  },
  description:
    'The Traditional Latin Mass, offered every week at the Chapel of Our Lady of the Blessed Sacrament, Society of Saint Pius X, Pinelands, Cape Town.',
  icons: { icon: '/favicon.svg' },
  // Phone numbers are already links; stops Safari rewriting the page before React takes over.
  formatDetection: { telephone: false },
  openGraph: { type: 'website', locale: 'en_ZA', siteName: 'SSPX Cape Town' },
}

export const viewport: Viewport = { themeColor: '#16213A' }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled: preview }, settings, schedule, banner] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getMassSchedule(),
    getAnnouncementBanner(),
  ])

  return (
    <html lang="en-ZA" className={`${caps.variable} ${serif.variable} ${body.variable}`}>
      <head>
        {/* Without JavaScript the Menu button cannot work, so show the menu open instead. */}
        <noscript
          dangerouslySetInnerHTML={{ __html: '<style>.nav-toggle{display:none!important}.main-nav{display:block!important}</style>' }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {preview && (
          <>
            <PreviewBanner />
            <LivePreviewListener />
          </>
        )}
        <Header settings={settings} schedule={schedule} />
        <HideOnHome>
          <AnnouncementRibbon banner={banner} />
        </HideOnHome>
        <main id="main">{children}</main>
        <Footer settings={settings} schedule={schedule} />
      </body>
    </html>
  )
}
