# Meridian AI

Meridian AI is a focused AI workspace built for clear, persistent thinking. Ask questions in plain language and get structured, Markdown-rendered responses with support for lists and code blocks. Every conversation is securely saved to your account, so you can return to previous discussions and continue exactly where you left off. Built with Next.js and Supabase, Meridian AI uses PostgreSQL for persistent data and authentication, while Groq powers the AI responses through a server-side route that keeps the API key securely out of the browser.

## Features

- **Email / password authentication** via Supabase Auth (email confirmation, password reset, session refresh).
- **Persistent chat workspace** — every user and assistant message is saved to your account and reloaded on return.
- **Markdown answers** with rendered headings, lists, quotes, and code blocks with a copy-to-clipboard button.
- **Credit system** — new accounts start with 10 credits, one message costs one credit, and the balance refreshes automatically when depleted.
- **Dashboard** — credit balance, recent activity, account details, and a quick path back into the workspace.
- **Responsive UI** — mobile, tablet, and desktop layouts with light/dark/system theming.

## Tech Stack

- **Next.js 16** (App Router) with React 19 and TypeScript
- **Tailwind CSS 3** with shadcn/ui-style Radix components (Button, Card, Input, DropdownMenu, etc.)
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) for auth and Postgres with Row Level Security
- **Groq API** (OpenAI-compatible chat completions) via a server route
- Supporting: `next-themes`, `lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # POST /api/chat — history, Groq call, credit deduction
│   │   └── credits/route.ts         # GET /api/credits — current credit balance
│   ├── auth/                        # login, sign-up, forgot/update password, confirm, error, success
│   ├── chatbot/                     # chat workspace (page.tsx + chat-interface.tsx)
│   ├── protected/                   # dashboard (layout.tsx + page.tsx)
│   ├── globals.css                  # design tokens (palette, typography, utilities)
│   ├── layout.tsx                   # root layout, fonts, theme provider
│   └── page.tsx                     # public landing page
├── components/
│   ├── auth/auth-shell.tsx          # auth page shell layout
│   ├── brand/wordmark.tsx           # Meridian logo/glyph
│   ├── ui/                          # shadcn-style primitives (button, card, input, ...)
│   ├── code-block.tsx               # code rendering with copy button
│   ├── markdown.tsx                 # lightweight markdown renderer
│   ├── product-preview.tsx          # landing-page product mockup
│   ├── login-form.tsx / sign-up-form.tsx / forgot-password-form.tsx / update-password-form.tsx
│   ├── header-actions.tsx / logout-button.tsx / theme-switcher.tsx
│   └── site-header.tsx / site-footer.tsx
├── lib/
│   ├── supabase/                    # client.ts, server.ts, proxy.ts (session middleware)
│   ├── brand.ts                     # brand copy, tagline, starter prompts
│   ├── credits.ts                   # auth + get/decrement credit helpers (RPC wrappers)
│   ├── datetime.ts                  # timeAgo helper
│   └── utils.ts                     # cn() class merger
├── supabase/migrations/             # 001_create_credits.sql, 002_grant_message_access.sql
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Supabase project settings > API (https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key

# Groq (https://console.groq.com/keys) — server-side only
GROQ_API_KEY=your-groq-api-key
```

| Variable | Public | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (safe to expose) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes (anon key, intended for clients) | Supabase anon/publishable key |
| `GROQ_API_KEY` | **No — server only** | Groq API key used in `app/api/chat/route.ts` |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the migrations in order:
   - `supabase/migrations/001_create_credits.sql` — creates `credits` and `messages` tables, RLS policies, credit RPC functions, and the new-user credits trigger.
   - `supabase/migrations/002_grant_message_access.sql` — grants `SELECT, INSERT` on `messages` to the `authenticated` role.
3. Confirm **Email** provider is enabled in Authentication so confirmation links and password resets work.
4. Copy the project URL and anon/publishable key into `.env`.

Supabase is used for: user authentication (sessions, email confirmation, password reset), and the Postgres database that stores credits and chat messages behind Row Level Security (RLS policies restrict each row to its owner, and credit mutations run through `SECURITY DEFINER` RPC functions).

## Groq Setup

1. Create an API key at [console.groq.com/keys](https://console.groq.com/keys).
2. Set `GROQ_API_KEY` in `.env`.
3. The chat route calls Groq's OpenAI-compatible endpoint (`https://api.groq.com/openai/v1/chat/completions`) with the `openai/gpt-oss-120b` model, a 60s timeout, and one retry on transient failures.

The key is read only inside the server route and is never exposed to the client.

## Installation & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   then fill in your Supabase and Groq values

# 3. Start the dev server (http://localhost:3000)
npm run dev
```

Available scripts:

```bash
npm run dev     # Next.js dev server (add `-- -p <port>` to change the port)
npm run lint    # ESLint
npm run build   # production build
npm start       # run the production build
```

## Production Build

```bash
npm run build
npm start
```

Deploy on any Node.js platform (e.g. Vercel after setting the same environment variables in the platform's dashboard).

## Security Notes

- `.env` is gitignored and must **never be committed**. All files matching `.env*.local` are ignored too.
- `GROQ_API_KEY` is read server-side only; never expose it in client components or `NEXT_PUBLIC_*` variables.
- `NEXT_PUBLIC_*` variables are publicly visible in the browser bundle by design — never put secrets there.
- The database relies on Row Level Security: every RLS policy scopes queries to the authenticated user's own rows, and `messages` grants are limited to the minimum (`SELECT`, `INSERT`).
- Treat any API key pushed to Git as compromised — rotate it immediately.

## Live Demo

Live Project: [Meridian AI](https://meridian-ai-sepia.vercel.app/)

## Author

 Haseeba Yasin