import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Events } from './collections/Events'
import { FormSubmissions } from './collections/FormSubmissions'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Roles } from './collections/Roles'
import { Users } from './collections/Users'
import { HomePage } from './globals/HomePage'
import { MassSchedule } from './globals/MassSchedule'
import { SiteSettings } from './globals/SiteSettings'
import { getServerSideURL } from './lib/url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL = getServerSideURL()

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · SSPX Cape Town',
      description: 'Content management for the SSPX Cape Town website.',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
      beforeDashboard: ['@/components/admin/BeforeDashboard#BeforeDashboard'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Posts, Events, Media, FormSubmissions, Users, Roles],
  globals: [HomePage, MassSchedule, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // Without a Resend key (local development) emails are printed to the console.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'website@fsspx.co.za',
        defaultFromName: process.env.RESEND_FROM_NAME || 'SSPX Cape Town',
      })
    : undefined,
  sharp,
  plugins: [
    seoPlugin({
      collections: ['posts'],
      globals: ['home-page'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) =>
        doc?.title ? `${doc.title} · SSPX Cape Town` : 'Our Lady of the Blessed Sacrament · SSPX Cape Town',
      generateDescription: ({ doc }) => doc?.excerpt || '',
      generateURL: ({ doc, collectionSlug }) =>
        collectionSlug === 'posts' && doc?.slug ? `${serverURL}/news/${doc.slug}` : serverURL,
    }),
    // Uploads go to Vercel Blob in production. Locally they are kept in ./media.
    // alwaysInsertFields keeps the database schema identical with and without a
    // token, so migrations generated locally match production.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      clientUploads: true,
    }),
  ],
})
