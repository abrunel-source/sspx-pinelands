import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Public_Sans } from 'next/font/google'
import { draftMode } from 'next/headers'

import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { LivePreviewListener } from '@/components/site/LivePreviewListener'
import { PreviewBanner } from '@/components/site/PreviewBanner'
import { getMassSchedule, getSiteSettings } from '@/lib/queries'
import { getServerSideURL } from '@/lib/url'

import '@/styles/global.css'

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
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
  openGraph: { type: 'website', locale: 'en_ZA', siteName: 'SSPX Cape Town' },
}

export const viewport: Viewport = { themeColor: '#17181C' }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled: preview }, settings, schedule] = await Promise.all([
    draftMode(),
    getSiteSettings(),
    getMassSchedule(),
  ])

  return (
    <html lang="en-ZA" className={`${serif.variable} ${sans.variable}`}>
      <head>
        {/* Lets CSS collapse the mobile menu only when JavaScript can reopen it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
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
        <main id="main">{children}</main>
        <Footer settings={settings} schedule={schedule} />
      </body>
    </html>
  )
}
