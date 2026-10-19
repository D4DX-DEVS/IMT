# Islamic Mission Trust (IMT) — Website

Next.js 16 (App Router) rebuild of https://imtpmna.org with Tailwind CSS v4 and Motion animations.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/site.ts` | **All site content** — text, institutions & courses, gallery, news posts, contact details |
| `public/images/` | All images migrated from the WordPress media library |
| `src/app/` | Routes: `/`, `/about`, `/gallery`, `/news`, `/news/[slug]` |
| `src/components/` | Navbar, footer, page hero, reveal/stagger animations, gallery lightbox |
| `src/components/home/` | Homepage sections (hero, stats, intro, institutions, gallery teaser) |

To change any text, edit `src/data/site.ts`. Old WordPress URLs `/hello-world` and `/category/uncategorized` redirect to `/news`.
