# GitHub & Firebase Hosting Setup Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `sostagey`
3. **Description:** Automated UK theatre news digest
4. Choose **Public** or **Private**
5. **Important:** Do NOT check "Add a README file", "Add .gitignore", or "Choose a license" (we already have these)
6. Click **"Create repository"**

## Step 2: Connect Local Repo to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/sostagey.git
git branch -M main
git push -u origin main
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/sostagey.git
git branch -M main
git push -u origin main
```

## Step 3: Set Up Firebase Hosting

### Option A: Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/sostagey-755ad/hosting)
2. Click **"Get started"** under Hosting
3. Click **"Connect GitHub"** or **"Add new repository"**
4. Authorize Firebase to access your GitHub account
5. Select your repository: `sostagey`
6. Configure build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Output directory:** `.next`
   - **Root directory:** `/` (or leave blank)
7. Click **"Save"** or **"Deploy"**

### Option B: Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your project: `sostagey-755ad`
   - What do you want to use as your public directory? `.next`
   - Configure as a single-page app? **No**
   - Set up automatic builds and deploys with GitHub? **Yes** (if you want CI/CD)
   - File `.next/static/*` already exists. Overwrite? **No**

4. Create `firebase.json` (should be auto-generated):
   ```json
   {
     "hosting": {
       "public": ".next",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Step 4: Configure Environment Variables in Firebase

For Firebase Hosting (if using GitHub integration):

1. Go to Firebase Console → Your Project → Hosting
2. Click on your site → **"Environment variables"** or **"Build settings"**
3. Add all the environment variables from your `.env.local`:
   - `OPENAI_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

**Note:** For Next.js on Firebase Hosting, you may want to use Vercel instead, as it's optimized for Next.js. Firebase Hosting works better with static sites or when using Firebase Functions for server-side rendering.

## Alternative: Deploy to Vercel (Recommended for Next.js)

Vercel is the recommended platform for Next.js apps:

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your `sostagey` repository
5. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
6. Add environment variables (copy from `.env.local`)
7. Click **"Deploy"**

Vercel will automatically deploy on every push to `main` branch.

## Step 5: Set Up Scheduled Scraping

After deployment, set up hourly scraping:

### Option A: Vercel Cron Jobs
1. Create `vercel.json` in project root:
   ```json
   {
     "crons": [{
       "path": "/api/fetchNews",
       "schedule": "0 * * * *"
     }]
   }
   ```

### Option B: GitHub Actions
Create `.github/workflows/scrape.yml`:
```yaml
name: Scrape News
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run scrape
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
```

Add secrets in GitHub: Settings → Secrets and variables → Actions

### Option C: Firebase Cloud Functions
More complex but integrates well with Firebase. See Firebase documentation for setting up scheduled functions.

---

## Quick Reference

**GitHub Repo:** After creating, run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sostagey.git
git push -u origin main
```

**Firebase Hosting:** Use Firebase Console → Hosting → Connect GitHub

**Vercel (Recommended):** Import repo from GitHub, add env vars, deploy

