# Deployment Plan: Vercel & Supabase (Free Tier)

This document outlines the recommended approach for deploying the JPHeritage Unified Digital Bank application for free. 

## The Best Free Cloud Stack

Since this is a Next.js application, the industry standard and most recommended free hosting provider is **Vercel**. However, because Vercel uses "Serverless" functions, it does not have a persistent local hard drive. This means our current local `SQLite` database will reset on every deployment and potentially between user visits. 

To host this properly on a free tier, we must migrate the database from SQLite to a free **PostgreSQL** cloud database. We will use **Supabase** (or Neon), which offers an excellent free tier for Postgres.

### Technology Stack
- **Frontend & Backend Hosting:** Vercel (Free Hobby Tier)
- **Database Hosting:** Supabase (Free PostgreSQL Tier)
- **ORM:** Prisma (Already installed, requires provider update)

---

> [!CAUTION]
> Moving to Vercel requires switching from SQLite to PostgreSQL. The current database records stored on your local machine will not automatically transfer to the cloud without a manual data migration script. Are you okay with starting fresh with an empty cloud database for the live demo?

## User Review Required
Please review this approach. If you approve, I will execute the following steps to prepare your code for deployment. You will need to manually sign up for Vercel and Supabase accounts to finalize the deployment, which I will guide you through.

---

## Proposed Changes

We will prepare the repository for Vercel deployment by updating our Prisma configuration.

### 1. Prisma Configuration Update
Switch the database provider from `sqlite` to `postgresql`.

#### [MODIFY] `prisma/schema.prisma`
```diff
- datasource db {
-   provider = "sqlite"
-   url      = "file:./dev.db"
- }
+ datasource db {
+   provider = "postgresql"
+   url      = env("DATABASE_URL")
+   directUrl = env("DIRECT_URL")
+ }
```

### 2. Dependency Adjustments
Ensure standard build scripts in `package.json` are optimized for Vercel, specifically ensuring `prisma generate` runs correctly during the Vercel build process.

#### [MODIFY] `package.json`
Add the `postinstall` script if it doesn't already exist.
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

---

## Deployment Walkthrough (Manual Steps for You)

Once the code changes above are committed and pushed to GitHub, you will need to perform these steps in your browser:

### Step 1: Create the Cloud Database (Supabase)
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a new Project.
3. Once provisioned, go to **Project Settings > Database** and copy your Connection Strings (both the standard connection string and the transaction pooler string).

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and create a free account linked to your GitHub.
2. Click **Add New Project** and select the `jph` repository.
3. In the Configuration screen, open the **Environment Variables** section.
4. Add the following variables:
   - `DATABASE_URL`: (Paste your Supabase standard connection string)
   - `DIRECT_URL`: (Paste your Supabase direct connection string)
   - *Any other `.env` variables your local project requires.*
5. Click **Deploy**.

Vercel will automatically run `npm install`, generate the Prisma client, and build your Next.js application. Your portal will be live on a free `.vercel.app` domain!
