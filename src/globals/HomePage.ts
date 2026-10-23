import type { Field, GlobalConfig } from 'payload'

import { enforceGlobalPublish, globalAccess } from '../access/permissions'
import { revalidateSite } from '../hooks/revalidate'
import { previewPath } from '../lib/url'

const eyebrow = (defaultValue: string): Field => ({
  name: 'eyebrow',
  label: 'Small heading',
  type: 'text',
  defaultValue,
})

const heading = (defaultValue: string): Field => ({
  name: 'heading',
  type: 'text',
  required: true,
  defaultValue,
})

const image = (name = 'image', description?: string): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  admin: description ? { description } : undefined,
})

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: {
    group: 'Content',
    description: 'Every section of the home page. Changes autosave as a draft; press Publish to put them live.',
    livePreview: { url: () => previewPath('/') },
    preview: () => previewPath('/'),
  },
  access: globalAccess('home-page'),
  hooks: {
    beforeChange: [enforceGlobalPublish('home-page')],
    afterChange: [revalidateSite],
  },
  versions: { drafts: { autosave: { interval: 800 } }, max: 50 },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'hero',
          label: 'Welcome',
          fields: [
            { name: 'kicker', type: 'text', defaultValue: 'Priestly Society of Saint Pius X · Cape Town' },
            heading('The Traditional Latin Mass, offered every week in Cape Town.'),
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Our Lady of the Blessed Sacrament upholds Catholic tradition and prevails in her call of souls to their everlasting home. All are welcome.',
            },
            image('image', 'Large photo behind the welcome text. A wide, landscape photo works best.'),
          ],
        },
        {
          name: 'visit',
          label: 'Plan your visit',
          fields: [
            eyebrow('Plan your visit'),
            heading('New to the Traditional Mass?'),
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Once housed in the old local post office, our chapel now stands on the centre square overlooking the park. Whether you are returning to the faith or discovering the ancient liturgy for the first time, you will be warmly received.',
            },
            image(),
            { name: 'imageCaption', type: 'text', defaultValue: 'Morning in the park across from the chapel, Pinelands' },
            {
              name: 'steps',
              type: 'array',
              labels: { singular: 'Step', plural: 'Steps' },
              maxRows: 6,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          name: 'quote',
          label: 'Quote',
          fields: [
            {
              name: 'latin',
              label: 'Quotation',
              type: 'text',
              defaultValue: 'Irrequietum est cor nostrum donec requiescat in Te, Domine.',
            },
            {
              name: 'translation',
              type: 'text',
              defaultValue: 'Our heart, O Lord, is restless, until it finds rest in Thee.',
            },
            { name: 'attribution', type: 'text', defaultValue: 'St Augustine, Confessions' },
          ],
        },
        {
          name: 'listen',
          label: 'Sermons',
          fields: [
            eyebrow('Listen & Watch'),
            heading('Sermons, Masses and the SSPX Podcast'),
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                "Missed Sunday, or want to hear a sermon again? Recorded Masses from our chapel and the Society's official podcast are always available.",
            },
            { name: 'youtubeTitle', type: 'text', defaultValue: 'Recorded Masses from our chapel' },
            {
              name: 'youtubeText',
              type: 'textarea',
              defaultValue: 'The newest recording plays first. Open the playlist to browse earlier Masses and sermons.',
            },
            { name: 'podcastTitle', type: 'text', defaultValue: 'Interviews, sermons and Q&A with SSPX priests' },
            {
              name: 'podcastText',
              type: 'textarea',
              defaultValue: 'The official English-language podcast of the Society, updated weekly.',
            },
          ],
        },
        {
          name: 'community',
          label: 'Community',
          fields: [
            eyebrow('Parish life'),
            heading('A faith lived together'),
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'Feast days, fêtes, shared meals and Christmas preparations. Life at Our Lady of the Blessed Sacrament extends well beyond Sunday morning.',
            },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Photo', plural: 'Photos' },
              maxRows: 8,
              fields: [
                image(),
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'caption', type: 'text', admin: { width: '60%' } },
                  ],
                },
              ],
            },
            {
              name: 'noEventsText',
              label: 'Text when no events are planned',
              type: 'text',
              defaultValue: 'Coming soon',
            },
          ],
        },
        {
          name: 'school',
          label: 'School',
          fields: [
            eyebrow('Catholic education'),
            heading('Homeschooling with faith at the heart of every subject'),
            {
              name: 'body',
              type: 'textarea',
              defaultValue:
                'Our Catholic homeschooling curriculum weaves the faith into every subject. Small class sizes give each child individual attention, and a close-knit community binds students, teachers and families together.',
            },
            { name: 'emphasis', type: 'text', defaultValue: 'Registrations for the new year open soon.' },
            image(),
            {
              name: 'showForm',
              label: 'Show the “Register interest” form',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
        {
          name: 'news',
          label: 'News',
          fields: [eyebrow('News & Reading'), heading('From the chapel')],
        },
        {
          name: 'give',
          label: 'Give',
          fields: [
            heading('Support the chapel'),
            {
              name: 'text',
              type: 'textarea',
              defaultValue:
                'Our chapel, its priests and its school are sustained entirely by the generosity of the faithful. Every gift helps keep the Traditional Mass alive in Cape Town.',
            },
            {
              name: 'buttonUrl',
              label: 'Donation link',
              type: 'text',
              admin: { description: 'Leave empty until online giving is set up.' },
            },
            { name: 'buttonLabel', type: 'text', defaultValue: 'Give online' },
            {
              name: 'bankDetails',
              type: 'textarea',
              admin: { description: 'Optional. Shown under the button, e.g. EFT details.' },
            },
            {
              name: 'comingSoonText',
              type: 'text',
              defaultValue: 'Online giving coming soon',
              admin: { description: 'Shown instead of the button when there is no donation link.' },
            },
          ],
        },
        {
          name: 'contact',
          label: 'Contact',
          fields: [
            eyebrow('Get in touch'),
            heading('Contact the chapel'),
            {
              name: 'intro',
              type: 'textarea',
              defaultValue:
                'For baptisms, weddings, confessions by appointment, sick calls or any question about the faith, send us a message and the priest will reply.',
            },
            { name: 'newsletterHeading', type: 'text', defaultValue: 'Stay up to date' },
            {
              name: 'newsletterText',
              type: 'text',
              defaultValue: 'Join the mailing list for Mass changes, feast days and announcements.',
            },
            {
              name: 'topics',
              label: 'Topics in the “What is it about?” list',
              type: 'array',
              fields: [{ name: 'label', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
