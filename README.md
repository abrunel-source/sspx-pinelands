# SSPX Cape Town website

Website and content management system for the **Chapel of Our Lady of the Blessed Sacrament**, Society of Saint Pius X, Pinelands, Cape Town.

- **Website:** Next.js 16, built from the approved design (Cormorant Garamond and Public Sans, chapel wine `#7A1F2B`).
- **CMS:** Payload 3 running inside the same app at `/admin`, with the SSPX logo on the admin screens.
- **Database:** Postgres. **Uploads:** Vercel Blob in production, `./media` locally. **Email:** Resend.

## What editors can do

| Area in the admin | What it controls |
| --- | --- |
| **Content › Home page** | Every heading, paragraph and photo on the home page. |
| **Content › Mass schedule** | Mass times (home page cards, hero box, footer), the First Fridays note, and an optional notice bar on every page. |
| **Content › News & articles** | News posts with rich text, cover image, author, category and SEO fields. Old WordPress links redirect here. |
| **Content › Events** | The next upcoming event appears in the Community section. Otherwise it reads "Coming soon". |
| **Content › Media library** | Photos, with focal point and required alt text. |
| **Inbox › Form submissions** | Every contact message, mailing-list sign-up and school registration, with a status and internal notes. |
| **Settings › Site settings** | Phone, email, address, map, YouTube and podcast links, and **the address website forms are emailed to** (default `o.keiser@fsspx.email`). |
| **Admin › Users / Roles** | Who can sign in, and what each person can see and change. |

**Drafts and live preview.** The home page, Mass schedule, news posts and events autosave as drafts. Open **Live preview** to see the real page update as you type, on phone, tablet or desktop sizes, then press **Publish**. Visitors only ever see published content. Every change is kept under **Versions** and can be restored. News posts can also be scheduled to publish later.

## Users, roles and permissions

Access is role-based. A **role** is a set of permissions, and a **user** can have several roles.

For each part of the CMS, a role can grant:

- **See**: the section appears in the menu and can be opened. Without it, the section is hidden from that person.
- **Create**, **Edit**, **Delete**.
- **Publish** (content with drafts): without it, the person can only save drafts for someone else to publish.
- **Own items only** (news, events, media): limits the permissions above to items that person created.

The seed creates four starter roles, which you can change or delete:

| Role | For |
| --- | --- |
| Administrator | Everything, including users and roles |
| Editor | All content, including publishing. No users or settings. |
| Contributor | Drafts their own news posts and events. Cannot publish. |
| Chapel office | Form submissions, the Mass schedule and events |

**Super admins** (a checkbox on the user) can do everything. The first account ever created becomes a super admin automatically.

Built-in safeguards:

- Only super admins can make or edit super admins.
- Nobody but a super admin can change their own roles.
- Nobody but a super admin can edit a role they hold.
- Everyone can always edit their own name, email and password.

Anyone with "Edit users" can still give *other* accounts any role, so give that permission only to people you trust with everything.

**Adding someone:** Admin › Users › Create new. Enter their name and email, choose their roles and set a temporary password. Then ask them to use **Forgot password?** on the login screen to choose their own.

## Automatic updates

Two scheduled tasks keep the home page current without anyone editing it (schedules in `vercel.json`, in UTC):

| When (Cape Town) | What |
| --- | --- |
| Every day, 07:00 | Fetches the newest video from the chapel's YouTube channel (the Sunday homily) and shows it in the Homilies section. If YouTube's feed is down, it reads the channel's Videos page instead; if both fail, the last homily stays up. |
| Fridays, 18:00 | Tops up **Feasts & calendar** for the next ten weeks from the 1962 Roman calendar ([Missale Meum](https://www.missalemeum.com)): Sundays and feasts of the first and second class, with their liturgical colours. Feasts added by hand are never changed and replace the automatic entry for that day. |

Both also run on every deploy, and can be run by hand with `npm run sync`. Set `CRON_SECRET` in Vercel so only Vercel's scheduler can trigger them.

## Local development

Requirements: Node 20.9+ and a Postgres database.

```bash
cp .env.example .env        # then fill in DATABASE_URL, PAYLOAD_SECRET, PREVIEW_SECRET
npm install
npm run migrate             # create the tables
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='choose-one' npm run seed
npm run dev                 # http://localhost:3000 and http://localhost:3000/admin
```

Without `RESEND_API_KEY`, emails (form notifications, password resets) are printed to the terminal instead of sent.

`npm run seed` loads the current site content: home page text, Mass times, contact details, the photos, the *Open Letter to Confused Catholics* post migrated from WordPress, and the starter roles. It never overwrites anything that already exists.

## Deploying (Vercel)

1. Create a Postgres database (for example Neon, from the Vercel Marketplace) and a **Vercel Blob** store, and connect both to the project.
2. In Resend, verify the sending domain (e.g. `fsspx.co.za`) and create an API key.
3. Set the environment variables from `.env.example` in Vercel: `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `NEXT_PUBLIC_SERVER_URL=https://fsspx.co.za`, `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`, `BLOB_READ_WRITE_TOKEN`.
4. Deploy. `vercel.json` runs `npm run ci`, which applies database migrations, loads the starting content if the media library is still empty (photos, home page, Mass times, the migrated post, starter roles), then builds. Content is only loaded on a database without photos, so later edits and deletions are never undone by a deploy. Without a Blob store connected, the text content loads and the photos follow on the first deploy after you connect one.
5. Open `/admin` and create the first account; it becomes a super admin.

## Changing the content model

After you add or change fields in `src/collections` or `src/globals`:

```bash
npm run generate:types                       # refresh src/payload-types.ts
npm run generate:importmap                   # if you added admin components
npm run migrate:create -- describe-change    # commit the new file in src/migrations
```

To make a new collection or global permissionable, add it to `src/access/resources.ts`. It then appears on the Roles screen automatically. Protect it with `collectionAccess()` or `globalAccess()` from `src/access/permissions.ts`.

## Project layout

```
src/
  access/          role-based permissions (resources list + access helpers)
  collections/     Posts, Events, Media, FormSubmissions, Users, Roles
  globals/         HomePage, MassSchedule, SiteSettings
  app/(frontend)/  the public website, form server action, preview routes
  app/(payload)/   the admin panel and REST/GraphQL API (generated by Payload)
  components/      site components and admin branding
  migrations/      database migrations
  seed/            initial content, photos and the migrated WordPress post
  styles/          site stylesheet (design tokens from the approved design)
```
