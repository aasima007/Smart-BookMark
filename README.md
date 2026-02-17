# Smart Bookmark App

A real-time bookmark manager built with Next.js 15 (App Router), Supabase, and Tailwind CSS.

**Live URL:** (https://smart-book-mark-gamma.vercel.app)
**Repo:** (https://github.com/aasima007/Smart-BookMark)

---

## Features

- **Google OAuth only** — No email/password flow. Handled entirely by Supabase Auth.
- **Private bookmarks** — Row Level Security ensures User A can never see User B's data.
- **Real-time sync** — Supabase Realtime (postgres_changes) pushes INSERT/DELETE events to all open tabs instantly, without polling or page refreshes.
- **Optimistic UI** — Deletes and adds are reflected immediately in the UI, with rollback on error.
- **Deployed on Vercel** — CI/CD via GitHub integration.

---

## Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Framework    | Next.js 15 (App Router)             |
| Auth         | Supabase Auth (Google OAuth)        |
| Database     | Supabase (PostgreSQL + RLS)         |
| Real-time    | Supabase Realtime (postgres_changes)|
| Styling      | Tailwind CSS                        |
| Deployment   | Vercel                              |

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/aasima007/Smart-BookMark.git
cd smart-bookmark-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, paste and run the contents of `supabase-setup.sql`.

### 3. Configure Google OAuth in Supabase

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Create a Google Cloud OAuth app:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create project → APIs & Services → Credentials → OAuth 2.0 Client ID
4. Copy the **Client ID** and **Client Secret** into Supabase

### 4. Enable Realtime

In Supabase Dashboard → **Database** → **Replication**, enable the `bookmarks` table under `supabase_realtime`.

### 5. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add the same environment variables in Vercel project settings
4. Add your Vercel URL to Supabase Auth → **URL Configuration** → **Site URL** and **Redirect URLs**:
   - Site URL: `https://smart-book-mark-gamma.vercel.app`
   - Redirect URL: `https://smart-book-mark-gamma.vercel.app/auth/callback`

---

## Problems I Ran Into & How I Solved Them

### 1. Real-time deduplication

**Problem:** When a bookmark is added, both the optimistic update (immediate) and the Supabase Realtime event fire. Without deduplication, bookmarks would appear twice.

**Solution:** In both the INSERT handler and the optimistic update, I check `if (prev.find((b) => b.id === data.id)) return prev` before inserting. Whichever arrives first wins; the second is silently skipped.

### 2. Supabase Realtime filter for private data

**Problem:** The Realtime subscription needs to be filtered so users only receive their own bookmark events, not everyone else's (even though RLS prevents reads, realtime broadcasts bypassed this without explicit filters).

**Solution:** Used the `filter` option in `.on("postgres_changes", { filter: "user_id=eq.${user.id}" }, ...)`. Also required enabling RLS and ensuring the `supabase_realtime` publication was set up correctly.

### 3. Cookies in Next.js 15 App Router

**Problem:** `cookies()` from `next/headers` is now async in Next.js 15 (it returns a Promise). The Supabase SSR helper requires synchronous cookie access patterns, causing type errors.

**Solution:** `await`ed the `cookies()` call before passing to `createServerClient`, and wrapped `setAll` in a try/catch since Server Components can't set cookies (only Route Handlers and Middleware can).

### 4. OAuth redirect URL mismatch on Vercel

**Problem:** Google OAuth was rejecting redirects because the authorized callback URI in Google Cloud Console only listed localhost.

**Solution:** Added both `http://localhost:3000/auth/callback` (dev) and `https://your-app.vercel.app/auth/callback` (prod) to the authorized redirect URIs in Google Cloud Console, AND added the Vercel URL to Supabase Auth → URL Configuration.

### 5. Delete confirmation UX

**Problem:** A single-click delete was too destructive — it's easy to accidentally delete a bookmark.

**Solution:** Implemented a two-step delete: first click shows "Confirm?" with a 3-second auto-cancel timeout. This pattern avoids modal overhead while preventing accidental deletions.

---

## Architecture Decisions

- **App Router over Pages Router** — Better support for server/client component split, streaming, and the Supabase SSR pattern.
- **Server-side initial data fetch** — The bookmarks page fetches data server-side before hydration, so there's no loading flash on first visit.
- **Client-side Realtime** — Supabase Realtime requires a browser WebSocket connection, so it lives in a client component (`BookmarksDashboard`).
- **Optimistic updates** — Rather than waiting for Realtime to confirm, UI updates happen immediately. Realtime is the source of truth for cross-tab sync.
