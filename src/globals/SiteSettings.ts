import type { GlobalConfig } from 'payload'

import { globalAccess } from '../access/permissions'
import { revalidateSite } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Contact details and links used in the header, footer and contact section.',
  },
  access: globalAccess('site-settings'),
  hooks: { afterChange: [revalidateSite] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', required: true, defaultValue: '021 531 0694', admin: { width: '50%' } },
                {
                  name: 'email',
                  label: 'Public email',
                  type: 'email',
                  required: true,
                  defaultValue: 'sspxcapetown@gmail.com',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'formsRecipient',
              label: 'Send website forms to',
              type: 'email',
              required: true,
              defaultValue: 'o.keiser@fsspx.email',
              admin: {
                description:
                  'Contact messages, mailing-list sign-ups and school registrations are emailed here. They are also kept under Form submissions.',
              },
            },
          ],
        },
        {
          label: 'Location',
          fields: [
            { name: 'chapelName', type: 'text', required: true, defaultValue: 'Chapel of Our Lady of the Blessed Sacrament' },
            {
              type: 'row',
              fields: [
                { name: 'street', type: 'text', required: true, defaultValue: '2a St Stephens Road', admin: { width: '40%' } },
                { name: 'suburb', type: 'text', required: true, defaultValue: 'Pinelands', admin: { width: '30%' } },
                { name: 'city', type: 'text', required: true, defaultValue: 'Cape Town', admin: { width: '30%' } },
              ],
            },
            { name: 'parking', type: 'text', defaultValue: 'In the parking area next to the church' },
            {
              name: 'directionsUrl',
              label: 'Google Maps link',
              type: 'text',
              defaultValue: 'https://maps.google.com/?cid=3354026342701529790',
            },
            {
              name: 'mapEmbedUrl',
              label: 'Google Maps embed URL',
              type: 'textarea',
              admin: {
                description: 'In Google Maps: Share › Embed a map, then copy only the address inside src="…".',
              },
              defaultValue:
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.0751826742885!2d18.49626381803948!3d-33.93919436739519!2m3!1f0!2f0!3fx0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dcc5ceced3243a1%3A0x2e8be5303406fabe!2sSSPX%20-%20Chapel%20Of%20Our%20Lady%20Of%20The%20Blessed%20Sacrament!5e0!3m2!1sen!2sza!4v1720443775175!5m2!1sen!2sza',
            },
          ],
        },
        {
          label: 'Sermons & media',
          fields: [
            { name: 'youtubeUrl', label: 'YouTube channel (homilies)', type: 'text', defaultValue: 'https://www.youtube.com/@mgpwild' },
            {
              name: 'youtubeChannelId',
              label: 'YouTube channel ID',
              type: 'text',
              defaultValue: 'UCALIHWtnVE-4Tqe-mW8Xuyw',
              admin: {
                description:
                  'Starts with UC. Every morning at 07:00 the website checks this channel and shows its newest homily.',
              },
            },
            {
              name: 'youtubePlaylistId',
              label: 'Fallback playlist',
              type: 'text',
              defaultValue: 'UUALIHWtnVE-4Tqe-mW8Xuyw',
              admin: {
                description: 'Shown only if the newest homily cannot be found. The default is the channel’s uploads.',
              },
            },
            {
              name: 'latestHomily',
              label: 'Latest homily (updated automatically)',
              type: 'group',
              admin: {
                description: 'Filled in every morning at 07:00 from the YouTube channel. No need to edit.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'videoId', type: 'text', admin: { readOnly: true, width: '30%' } },
                    { name: 'title', type: 'text', admin: { readOnly: true, width: '70%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'publishedAt', label: 'Published', type: 'date', admin: { readOnly: true, width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
                    { name: 'checkedAt', label: 'Last checked', type: 'date', admin: { readOnly: true, width: '50%', date: { pickerAppearance: 'dayAndTime' } } },
                  ],
                },
              ],
            },
            {
              name: 'podcastUrl',
              type: 'text',
              defaultValue: 'https://podcasts.apple.com/us/podcast/sspx-podcast/id1237387297',
            },
            {
              name: 'podcastEmbedUrl',
              type: 'text',
              defaultValue: 'https://embed.podcasts.apple.com/us/podcast/sspx-podcast/id1237387297',
            },
          ],
        },
      ],
    },
  ],
}
