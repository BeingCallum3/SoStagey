## SoStagey

Automated UK theatre news digests. The stack follows `PROJECT_SPEC.md`: Next.js App Router, Tailwind, Firebase Firestore, OpenAI summarisation, and Cheerio-based scraping.

### 1. Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- OpenAI API key (GPT-4.1 Mini access)

### 2. Environment variables

Copy `env.example` to `.env.local` (for Next.js) and `.env` (for the cron/script) and populate:

```
OPENAI_API_KEY="sk-..."
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="service-account@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:abc"

# optional: override feed sources (comma-separated RSS URLs)
SCRAPE_TARGETS="https://www.thestage.co.uk/feed,https://www.whatsonstage.com/news/feed/"
```

When pasting the Firebase private key, keep the literal `\n` sequences for env files.

### 3. Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 for the live feed. The homepage fetches the newest 10 articles and progressively loads more via `/api/getNews`.

### 4. Manual scrape / cron

To seed data or run from cron (e.g. GitHub Actions, Firebase Scheduled Function):

```bash
npm run scrape
```

The script loads `.env` (server credentials), scrapes configured feeds, summarises with OpenAI, and writes new articles to Firestore while skipping duplicates by URL.

### 5. API endpoints

- `POST /api/fetchNews` — On-demand scrape + summarise + store. Accepts `{ "limit": number }` (defaults to 20).
- `GET /api/getNews` — Paginated list, query params `cursor` (ISO string) and `pageSize` (1-50, default 10).

Both routes are `force-dynamic` to ensure fresh data and rely on Firebase Admin credentials server-side.

### 6. Deployment notes

- For Vercel/Firebase Hosting, add the same env vars to the platform.
- Schedule hourly digests via: Vercel cron hitting `/api/fetchNews`, Firebase Functions with `onSchedule`, or GitHub Actions running `npm run scrape`.
- Firestore security: Configure read-only rules for published content, restrict writes to service accounts/Cloud Functions.

### 7. Future work

- Add SendGrid email digest via Cloud Functions (see spec).
- Expand scraping sources with Playwright fallbacks for sites lacking RSS feeds.
- Add integration tests for API routes and summarisation fallbacks.

### 8. Testing

- `npm run lint` — TypeScript + ESLint sanity checks.
- Manual: run `npm run dev`, trigger `POST /api/fetchNews` (or `npm run scrape`) and confirm new cards appear in the feed and Firestore.
