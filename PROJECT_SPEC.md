# SoStagey — Automated Theatre News Digest

## Project Overview

SoStagey is an automated web app that scrapes UK theatre news hourly, summarizes each article with AI, and stores the data in Firebase. The site displays the latest 10 articles with an infinite “Load More” scroll, and will later support daily digest email automation.

This README is written to guide **Cursor AI** or **GitHub Copilot Workspace** to build the full project automatically.

---

## Core Stack

- **Framework:** Next.js (React, App Router)
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting (or Vercel)
- **Styling:** Tailwind CSS
- **Scraping:** Node.js Cheerio or Playwright
- **AI Summarization:** OpenAI GPT API
- **Pagination:** Infinite scroll using Firestore pagination
- **Email Automation (future):** Firebase Cloud Functions + SendGrid

---

## High-Level Architecture

1. **Scraper (Serverless cron)**  
   - Runs hourly.
   - Fetches latest UK theatre news from target sites (e.g. *The Stage*, *WhatsOnStage*, *BroadwayWorld UK*).
   - Extracts: headline, source, publication date, URL, and article text.
   - Sends article text to OpenAI for summarization.
   - Stores summary + metadata in Firestore.

2. **Frontend (Next.js)**  
   - Displays the most recent 10 news items (headline, source, summary, link).
   - Infinite scroll to load more articles (10 at a time).
   - Basic clean UI with Tailwind.

3. **API Routes (Next.js App Router)**  
   - `/api/fetchNews` – endpoint for on-demand scraping (manual trigger or cron).
   - `/api/getNews` – paginated Firestore fetch for frontend.

4. **Firebase Firestore Schema**

```json
{
  "articles": {
    "id": "auto-generated",
    "headline": "string",
    "summary": "string",
    "url": "string",
    "source": "string",
    "publishedAt": "timestamp",
    "createdAt": "timestamp"
  }
}