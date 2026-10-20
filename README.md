# Islamic Mission Trust (IMT) — Website

Next.js 16 (App Router) rebuild of https://imtpmna.org with Tailwind CSS v4 and Motion animations, and an
admin panel for editing everything on the site.

```bash
npm install
cp .env.example .env.local   # then set the admin username, password and session secret
npm run dev                  # site: http://localhost:3000   admin: http://localhost:3000/admin
npm run build && npm start
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
| `SESSION_SECRET` | At least 32 random characters (`openssl rand -hex 32`). Signs the login cookie |

Changing the password or the secret signs everyone out. After 5 wrong passwords from one address, sign-in is paused for
15 minutes. Serve the site over **HTTPS** in production — the login cookie is marked `Secure` there.

### Where the content and images are stored

Everything the admin edits is kept in **storage**, as plain files: `content.json` (all the text), `backups/` (the
previous 30 versions of it), `uploads/` (the images) and `media.json` (a small index of the image sizes).

| Mode | When | Where |
| --- | --- | --- |
| **DigitalOcean Spaces + CDN** | The `DO_SPACES_*` variables are set | In your Space. Uploaded images are public files that visitors load from the CDN; content, backups and the index stay private |
| **Local disk** | They are not set | `./data` (or `DATA_DIR`) — for development, or a server with a persistent disk. The site serves the images itself |

Local disk is git-ignored and **is erased on every deploy on DigitalOcean App Platform**, so production should use Spaces.
The dashboard shows which mode is active and has a **Test storage connection** button. It checks that files can be
saved and, if a CDN address is set, that the CDN really serves them, and says in plain words what's wrong if not.

#### Setting up Spaces and the CDN

1. In the DigitalOcean control panel: **Spaces Object Storage → Create a Space** (e.g. region `blr1`). Under the Space's
   **Settings → Content Delivery Network**, enable the CDN and note its address.
2. **API → Spaces Keys → Generate New Key.** Copy the key and the secret (the secret is shown only once).
3. Add these environment variables. Locally, put them in `.env.local` (or `.env`; `.env.local` wins if both set the same
   name). In App Platform: your app → Settings → App-Level Environment Variables, available at **both build and run
   time**, with the secrets marked as encrypted:

| Variable | Value |
| --- | --- |
| `DO_SPACES_KEY`, `DO_SPACES_SECRET` | The key pair from step 2 |
| `DO_SPACES_BUCKET` | The Space's name |
| `DO_SPACES_ENDPOINT` | The region's address, e.g. `https://blr1.digitaloceanspaces.com` (no Space name in it) |
| `DO_SPACES_REGION` | The region, e.g. `blr1`. Used to build the endpoint if `DO_SPACES_ENDPOINT` is left out |
| `DO_SPACES_CDN_URL` | The Space's CDN address, e.g. `https://my-space.blr1.cdn.digitaloceanspaces.com`. Images load from here |
| `DO_SPACES_FOLDER` | A folder inside the Space (e.g. `imt`); everything for this site is kept in it |

   Set `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_BUCKET` and one of `DO_SPACES_ENDPOINT` / `DO_SPACES_REGION`, or
   none of the `DO_SPACES_*` variables. A half-filled setup is reported as an error rather than silently falling back to
   local disk. Without `DO_SPACES_CDN_URL` everything still works, but the site serves the images itself instead of the CDN.
4. Open **/admin** and press **Test storage connection**.

Content refers to images as `/uploads/<name>`; the public site swaps in the CDN address when it reads the content, so
changing `DO_SPACES_CDN_URL` later (for example to a custom domain) needs only a restart.

#### Moving existing local content to a Space

If you already edited content locally (`./data`), copy it across once, with the `DO_SPACES_*` variables in `.env.local`:

```bash
npm run storage:migrate -- --dry-run   # list what would be copied
npm run storage:migrate                # copy (refuses if the Space already has content)
npm run storage:migrate -- --overwrite # replace the Space's content with the local one
```

If you set up the CDN after images were already uploaded, make them public so the CDN can serve them:

```bash
npm run storage:migrate -- --make-uploads-public
```

#### Good to know

- **One instance.** Saves are queued within a running server. Run a single instance of the site (the default on App
  Platform); two instances saving at the same moment could overwrite each other.
- **Builds read the content too.** The pages are prerendered at build time from whatever is in storage, which is why the
  `DO_SPACES_*` variables must also be available when building. After a build, edits made in the admin still show up
  immediately.
- **If storage is down**, pages that are already cached keep working, uncached pages show an error rather than default
  text, and the admin dashboard explains what is wrong.
- **Restoring a version:** copy a file from `backups/` over `content.json` (in the Space's file browser, or locally),
  then restart the site.
- Images are resized and cached by Next.js on top of the CDN. `DO_SPACES_FORCE_PATH_STYLE=true` exists only for testing
  against local S3 emulators such as MinIO; it isn't needed for DigitalOcean.

## How it fits together

| Path | What |
| --- | --- |
| `src/content/schema.ts` | The shape of all content (zod). Shared by the admin forms, the server and the site |
| `src/content/seed.ts` | The default content, taken from the original site |
| `src/content/store.ts` | Reads and writes `content.json` in storage (backups, cleanup of unused uploads) |
| `src/content/uploads.ts`, `media.ts` | Uploaded images: validation and resizing, and the index of their sizes |
| `src/storage/` | The storage layer: DigitalOcean Spaces (with CDN) and local disk behind one small interface |
| `scripts/migrate-to-spaces.mjs` | One-off copy of local data into a Space |
| `src/content/index.ts` | `getContent()` — what the public pages read. Cached until an admin save invalidates it |
| `src/app/(site)/` | The public pages: `/`, `/about`, `/contact`, `/gallery`, `/news`, `/institutions/[slug]` |
| `src/app/admin/` | The admin panel (`login/` and the editors under `(panel)/`) and its server actions |
| `src/app/api/admin/` | Image upload and the image library |
| `src/app/uploads/` | Serves uploaded images from storage (admin previews, and local development) |
| `src/proxy.ts` | Redirects anyone not signed in away from `/admin` |
| `src/lib/auth*.ts` | Session cookie and login checks |
| `src/data/nav.ts` | Header and footer link structure (the links themselves are fixed in code) |
| `public/images/` | Images shipped with the site, also selectable in the admin |
| `src/components/` | Header, footer, hero, animations, gallery lightbox; `admin/` holds the editor components |

Every admin page, server action and API route checks the session itself; the proxy is only the first line of defence.
Old WordPress URLs `/hello-world` and `/category/uncategorized` redirect to `/news`.
