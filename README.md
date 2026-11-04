# Islamic Mission Trust (IMT) — Website

Next.js 16 (App Router) rebuild of https://imtpmna.org with Tailwind CSS v4 and Motion animations, and an
admin panel for editing everything on the site. Hosted on **Cloudflare Workers** (via
[OpenNext](https://opennext.js.org/cloudflare)), with content in **D1** and uploaded images in **R2**.

```bash
npm install
cp .dev.vars.example .dev.vars   # then set the admin username, password and session secret
npm run db:migrate:local         # create the tables in the local dev database
npm run dev                      # site: http://localhost:3000   admin: http://localhost:3000/admin
npm run preview                  # build and run the real worker locally (workerd): http://localhost:8787
npm run deploy                   # build and deploy to Cloudflare
```

## Admin panel

Open **/admin** and sign in. From there you can edit:

| Section | What you can change |
| --- | --- |
| Site settings | Name, motto, address, phone, email, logo, emblem, footer text |
| Home page | Hero text and photo, the four key numbers, about text, mission & vision, campus photos, call-to-action band |
| About page | Story paragraphs, milestones, full mission and vision |
| Institutions | Add, edit, reorder (the first is the featured card) and delete schools, colleges and training centres, including their photo and course lists. Each gets its own page at `/institutions/<address>` |
| Gallery | Upload photos, write descriptions, reorder, remove |
| News | Write, edit and delete posts |

Changes go live as soon as you save. Images are uploaded from inside the editors (JPG, PNG, WebP or AVIF, up to 8 MB);
they are downsized to 2400 px and stripped of metadata such as GPS location.

### Signing in

The single admin account comes from environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | The login. Use a long, unique password in production |
| `SESSION_SECRET` | At least 16 characters; 32+ random ones are best (`openssl rand -hex 32`). Signs the login cookie |

Changing the password or the secret signs everyone out. After 5 wrong passwords from one address, sign-in is paused for
15 minutes. Serve the site over **HTTPS** in production — the login cookie is marked `Secure` there.

### Where the content and images are stored

All on the Cloudflare account `erp@d4dx.co` (ID `0f08a478556c8f3e0a22b6b086b3069f`, pinned in `wrangler.jsonc`):

| What | Where |
| --- | --- |
| All the text (one JSON document), its last 30 versions, the uploaded-image index, the login throttle | D1 database **`imt-db`** (binding `DB`; schema in `migrations/`) |
| Uploaded images (`uploads/<name>`) | R2 bucket **`imt-media`** (binding `MEDIA`, private) |
| Resizing uploads and serving resized copies (AVIF/WebP) | Cloudflare Images (binding `IMAGES`) |
| Cached pages (OpenNext incremental cache) | R2 bucket **`imt-website-opennext-cache`** |
| Cache tags (which cached pages a save invalidates) | D1 database **`imt-next-cache`** (binding `NEXT_TAG_CACHE_D1`) |

Content refers to images as `/uploads/<name>`; the worker serves them from R2 at that address, and next/image asks for
resized copies as `/uploads/<name>?w=…&q=75`, which Cloudflare Images makes once and the edge cache keeps. The dashboard
has a **Test storage connection** button that checks D1 and R2.

In development (`npm run dev` / `npm run preview`) the bindings are local emulations kept in `.wrangler/state`, so
nothing touches production.

### Deploying

```bash
npx wrangler whoami              # must show erp@d4dx.co
npm run db:migrate:remote        # only when migrations/ has a new file
npm run deploy
```

`npm run deploy` builds, uploads the worker and then runs `scripts/refresh-content-cache.mjs`. That step matters: the
build prerenders pages from the *local* database (usually the built-in default content), and the refresh marks those
pages stale in production so they are re-rendered from the real D1 content on the first request. If it fails, rerun
`node scripts/refresh-content-cache.mjs`, or save anything in the admin.

Secrets are set once per account (changing the password or the secret signs everyone out):

```bash
npx wrangler secret put ADMIN_USERNAME
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET   # 32+ random characters, e.g. openssl rand -hex 32
```

### Moving from DigitalOcean Spaces

`npm run storage:migrate` copies `content.json`, `backups/`, `media.json` and `uploads/` from the old Space (read from
the `DO_SPACES_*` variables in `.env`) into D1 and R2 on the account wrangler is logged in to. Use `-- --dry-run` first,
`-- --local` to try it against the local dev bindings, `-- --overwrite` to replace content already in D1. When this
site moved (November 2026) the Space's `IMT/` folder was empty, so there was nothing to copy.

### Good to know

- **Saves from several places at once are safe.** Each save checks the content version it started from and retries on
  top of a newer one, so edits never overwrite each other.
- **Sign-in throttle:** 5 attempts per address per 15 minutes, counted before the password is checked, kept in D1.
- **Restoring a version:** pick a row from `content_backups` and copy its `json` into `content` (Cloudflare dashboard →
  D1 → `imt-db` → Console, or `npx wrangler d1 execute imt-db --remote --command "…"`), then save anything in the admin
  so the cached pages refresh.
- **Deleted images** disappear from R2 at once, but copies already in a browser or Cloudflare's edge cache can live on
  for a while (they are cached as immutable).
- **`src/proxy.ts`** (the admin redirect) runs as Node.js middleware, which OpenNext supports experimentally. Every
  admin page and action re-checks the session anyway.
- Next's *Cache Components* (`cacheComponents`, `"use cache"`) is deliberately off: its request-time prerendering
  relies on Node.js timer internals and hangs on Workers. Content is cached with `unstable_cache` + `updateTag`.

## How it fits together

| Path | What |
| --- | --- |
| `src/content/schema.ts` | The shape of all content (zod). Shared by the admin forms, the server and the site |
| `src/content/seed.ts` | The default content, taken from the original site |
| `src/content/store.ts` | Reads and writes the content in D1 (versioned saves, backups, cleanup of unused uploads) |
| `src/content/uploads.ts`, `media.ts` | Uploaded images: validation and resizing (Cloudflare Images), R2 storage, and the D1 index of their sizes |
| `src/storage/` | Access to the Cloudflare bindings (D1, R2, Images) |
| `migrations/` | D1 schema |
| `scripts/` | Spaces → Cloudflare migration, post-deploy cache refresh, built-in image manifest |
| `wrangler.jsonc`, `open-next.config.ts` | Worker, bindings and cache configuration |
| `src/content/index.ts` | `getContent()` — what the public pages read. Cached until an admin save invalidates it |
| `src/app/(site)/` | The public pages: `/`, `/about`, `/contact`, `/gallery`, `/news`, `/institutions/[slug]` |
| `src/app/admin/` | The admin panel (`login/` and the editors under `(panel)/`) and its server actions |
| `src/app/api/admin/` | Image upload and the image library |
| `src/app/uploads/` | Serves uploaded images from R2, and resized copies of them |
| `src/proxy.ts` | Redirects anyone not signed in away from `/admin` |
| `src/lib/auth*.ts` | Session cookie and login checks |
| `src/data/nav.ts` | Header and footer link structure (the links themselves are fixed in code) |
| `public/images/` | Images shipped with the site, also selectable in the admin |
| `src/components/` | Header, footer, hero, animations, gallery lightbox; `admin/` holds the editor components |

Every admin page, server action and API route checks the session itself; the proxy is only the first line of defence.
Old WordPress URLs `/hello-world` and `/category/uncategorized` redirect to `/news`.
