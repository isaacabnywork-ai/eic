# Equip Indian Churches — Headless React Frontend

A production-ready, headless React website for **[Equip Indian Churches](https://equipindianchurches.com/)** — an online Christian resource ministry equipping pastors, leaders, and believers in India with biblical truth, expository sermons, videos, theological essays, and book reviews.

This project connects to WordPress as its headless CMS (managed via JetEngine and WordPress REST API) and serves a modern, performant, editorial frontend built with Vite, React, TanStack Query, and Tailwind CSS.

---

## 1. Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/) (Browser router, client-side caching, scroll restoration)
- **Data Fetching & Caching**: [TanStack Query v5 (React Query)](https://tanstack.com/query/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/typography`
- **Typography & Design**: Warm, editorial typography pairing **Playfair Display** (headings) with **Inter** (body), and design tokens for dark & light modes
- **SEO & Meta**: `react-helmet-async` for per-page title, meta tags, and Open Graph cards
- **Sanitization & Security**: `DOMPurify` for sanitizing WordPress markup with lazy-loaded iframes and media
- **TypeScript**: Strict typechecking throughout

---

## 2. Project File Tree

```
c:\EIC
├── .env.example               # Environment template
├── .env                      # Local environment configuration
├── .gitignore                # Git ignore rules
├── index.html                # HTML entry point with pre-paint theme script
├── netlify.toml              # Netlify build and redirect configuration
├── package.json              # NPM scripts and dependencies
├── SETUP.md                  # Detailed WordPress & JetEngine configuration steps
├── tsconfig.json             # Root TypeScript config
├── tsconfig.app.json         # Application TypeScript config
├── tsconfig.node.json        # Node scripts TypeScript config
├── vercel.json               # Vercel SPA routing configuration
├── vite.config.ts            # Vite configuration with Tailwind CSS plugin
├── public/
│   ├── .htaccess             # Apache / cPanel rewrite rules for SPA clean URLs
│   ├── _redirects            # Netlify SPA redirect rule
│   ├── favicon.svg           # Brand favicon mark
│   └── sitemap.xml           # XML sitemap generated dynamically
├── scripts/
│   ├── discover.js           # Automated WordPress REST API endpoint tester
│   └── sitemap.js            # Automated XML sitemap generator
└── src/
    ├── main.tsx              # Application root entry point
    ├── App.tsx               # Route definitions
    ├── index.css             # Tailwind CSS tokens, theme variables, and prose styles
    ├── vite-env.d.ts         # Vite environment types
    ├── api/                  # Unified data-access layer
    │   ├── client.ts         # Central fetch wrapper with error handling & headers
    │   ├── content.ts        # fetchPosts, fetchPost, fetchFeatured, searchAll
    │   ├── index.ts          # Barrel export for API
    │   ├── media.ts          # Gallery images extractor & media resolver
    │   ├── normalize.ts      # Normalizes raw WordPress REST objects into typed items
    │   ├── people.ts         # Author and contributor normalizer
    │   ├── series.ts         # Series card resolver with cover image detection
    │   ├── terms.ts          # fetchTerms, fetchAllTerms, term resolver
    │   ├── types.ts          # TypeScript interfaces (ContentItem, Term, Person, etc.)
    │   ├── users.ts          # fetchUsers, fetchUser
    │   └── mock/             # Offline mock data engine (when VITE_USE_MOCK=true)
    │       ├── data.ts       # Realistic demo datasets
    │       └── index.ts      # In-memory REST query engine
    ├── config/
    │   ├── content.ts        # Single configuration for endpoints, meta keys & rules
    │   ├── env.ts            # Environment variables parser
    │   └── site.ts           # Site identity, navigation structure & mega menus
    ├── hooks/
    │   ├── queries.ts        # TanStack Query custom hooks
    │   ├── useArchiveParams.ts # URL search-param sync for archives
    │   ├── useDebounce.ts    # Debounce utility hook
    │   └── useTheme.tsx      # Dark/light theme provider and hook
    ├── lib/
    │   ├── devWarn.ts        # Helpful dev-time warnings for missing REST fields
    │   ├── format.ts         # Date formatting, pluralization, and classnames
    │   ├── html.ts           # DOMPurify HTML sanitization & entity decoding
    │   ├── routes.ts         # Route path builders & WP link converter
    │   ├── video.ts          # YouTube, Vimeo, and video URL parser
    │   └── videoGroups.ts    # Sermon vs Video classification logic
    ├── components/
    │   ├── cards/            # Reusable card components
    │   │   ├── ArticleCard.tsx
    │   │   ├── AuthorCard.tsx
    │   │   ├── BookCard.tsx
    │   │   ├── EventCard.tsx
    │   │   ├── GalleryCard.tsx
    │   │   ├── SeriesCard.tsx
    │   │   ├── VideoCard.tsx
    │   │   └── index.ts
    │   ├── content/
    │   │   └── RichContent.tsx # Safe HTML renderer with link interception
    │   ├── layout/
    │   │   └── Layout.tsx     # Header + Main + Footer + Skip-link layout
    │   ├── media/
    │   │   ├── Lightbox.tsx   # Accessible photo lightbox modal
    │   │   └── VideoEmbed.tsx # Responsive 16:9 player with audio fallback
    │   ├── navigation/
    │   │   ├── FilterBar.tsx  # Dynamic search + taxonomy dropdowns for archives
    │   │   ├── Footer.tsx     # Footer with newsletter, links, and social marks
    │   │   └── Header.tsx     # Sticky header with responsive mega menu
    │   ├── seo/
    │   │   └── SeoHead.tsx    # react-helmet-async SEO wrapper
    │   └── ui/
    │       ├── Button.tsx     # Button & LinkButton variants
    │       ├── Carousel.tsx   # Touch-enabled scroll-snap carousel
    │       ├── Icons.tsx      # Inline SVG icon library
    │       ├── Img.tsx        # Lazy-loading image with skeleton fallback
    │       ├── Pagination.tsx # Numbered pagination component
    │       ├── QueryBoundary.tsx # Reusable loading / error / empty state switch
    │       ├── Section.tsx    # Section and PageHeader components
    │       ├── Skeleton.tsx   # Accessible skeleton loaders
    │       └── States.tsx     # EmptyState & ErrorState components
    └── pages/
        ├── ArticleSingle.tsx  # Single article reading page
        ├── ArticlesArchive.tsx# Article archive with filtering
        ├── AuthorSingle.tsx   # Single author profile and their articles
        ├── AuthorsArchive.tsx # Authors and speakers directory
        ├── BookReviewSingle.tsx # Book review single with rating and buy link
        ├── BookReviewsArchive.tsx # Book review archive
        ├── ChurchesArchive.tsx # Optional church directory (feature-flagged)
        ├── EventsArchive.tsx  # Events listing
        ├── GalleryArchive.tsx # Photo gallery albums archive
        ├── GallerySingle.tsx  # Masonry gallery album with lightbox
        ├── Home.tsx           # Homepage with Hero, slider, and section strips
        ├── NotFoundPage.tsx   # Custom 404 error page
        ├── SearchPage.tsx     # Global search across all content types
        ├── SeriesArchive.tsx  # Series index
        ├── SeriesSingle.tsx   # Single series view with included resources
        ├── SermonSingle.tsx   # Single sermon with speaker and video/audio embed
        ├── SermonsArchive.tsx # Sermons archive
        ├── VideoSingle.tsx    # Single video with player and related videos
        └── VideosArchive.tsx  # Videos archive
```

---

## 3. Getting Started

### 3.1 Prerequisites
- Node.js 18+ (tested with Node 22/24)
- npm 9+

### 3.2 Installation
Clone or open the repository directory:
```bash
cd c:\EIC
npm install
```

### 3.3 Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configuration parameters:
```env
# The URL of your WordPress backend (never hardcoded in application code)
VITE_WP_URL=https://equipindianchurches.com

# The public URL of this React app (for canonical SEO and Open Graph tags)
VITE_SITE_URL=https://equipindianchurches.com

# Set to true to run completely offline with mock data
VITE_USE_MOCK=false

# Feature flag for Church Directory page (/churches)
VITE_ENABLE_CHURCH_DIRECTORY=false

# Optional newsletter integration endpoint
VITE_NEWSLETTER_ACTION_URL=
```

### 3.4 Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Discovery Script

Before making changes to post types or meta keys, you can verify live WordPress endpoints using:

```bash
npm run discover
```

This script:
1. Queries `/wp-json/wp/v2/types` and prints the real REST bases.
2. Queries `/wp-json/wp/v2/taxonomies` to verify attached post types.
3. Fetches a sample item from each content type with `?_embed=1&per_page=1` and lists available meta/ACF/JetEngine fields.
4. Outputs findings to `scripts/discover-output.json`.

---

## 5. Offline Demo Mode (Mock Data)

If WordPress is unreachable or you wish to develop offline:
1. Open `.env` and set:
   ```env
   VITE_USE_MOCK=true
   ```
2. Restart or reload the app.
All pages, search, taxonomies, and archives will run against realistic in-memory demo data with simulated network latency without calling the live WordPress API.

---

## 6. Building for Production & Sitemap

To build the static production bundle:

```bash
npm run build
```

This runs:
1. `tsc -b --noEmit` — Strict TypeScript validation.
2. `vite build` — Production bundling, minification, and code splitting.
3. `node scripts/sitemap.js` — Automatically crawls published slugs and generates `public/sitemap.xml` and `dist/sitemap.xml`.

To preview the production build locally:
```bash
npm run preview
```

---

## 7. Deployment Instructions

### 7.1 Deploy to Vercel
1. Install the Vercel CLI (`npm i -g vercel`) or push the code to GitHub and import the project into Vercel.
2. Set Environment Variables in Vercel Dashboard:
   - `VITE_WP_URL`: `https://equipindianchurches.com`
   - `VITE_SITE_URL`: `https://your-vercel-domain.vercel.app`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. The included `vercel.json` ensures that all clean routes (`/articles/:slug`, `/videos/:slug`, etc.) rewrite to `/index.html`.

### 7.2 Deploy to Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in **Site Configuration > Environment Variables**:
   - `VITE_WP_URL`: `https://equipindianchurches.com`
5. The included `netlify.toml` and `public/_redirects` automatically handle SPA routing (`/* /index.html 200`).

### 7.3 Deploy to cPanel / Apache / Shared Hosting
1. Run `npm run build` locally or in CI.
2. Upload the contents of the `dist/` directory directly into your server's `public_html` (or subdomain document root).
3. The included `.htaccess` file (copied from `public/.htaccess` into `dist/.htaccess`) automatically configures `mod_rewrite` to route requests to `/index.html` and enables long-lived caching headers for static assets.

---

## 8. WordPress Setup Instructions

For instructions on:
- Enabling "Show in REST API" on JetEngine post types and meta fields,
- Enabling CORS headers for cross-domain queries,
- Application passwords, and
- Server caching,

Please refer to the accompanying [SETUP.md](file:///c:/EIC/SETUP.md).

---

## 9. License & Credits

Built for the ministry of **Equip Indian Churches**. All content is managed through WordPress and served under Christian ministry stewardship.
