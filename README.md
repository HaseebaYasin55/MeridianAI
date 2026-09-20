# Meridian

A focused AI workspace built with **Next.js, Supabase, PostgreSQL, and Groq API**. Users authenticate, receive credits, and spend **1 credit per AI message**. Conversations persist between visits.

## Features

* Supabase email authentication
* Protected chatbot and dashboard pages
* Credit-based AI usage
* Atomic credit deduction with PostgreSQL RPC
* Groq AI integration
* Server-side API key protection
* Persistent chat history
* Real-time credit balance updates
* Row Level Security (RLS)
* Responsive, calm AI workspace UI
* Markdown-rendered answers with copyable code blocks
* Clear thread functionality

## Tech Stack

* **Next.js** — App Router
* **React + TypeScript**
* **Tailwind CSS**
* **Supabase Auth**
* **Supabase PostgreSQL**
* **PostgreSQL RPC**
* **Groq API**
* **shadcn/ui**

## Project Structure

```text
meridian/
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   └── credits/route.ts
│   ├── auth/
│   ├── chatbot/
│   │   ├── chat-interface.tsx
│   │   └── page.tsx
│   ├── protected/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── brand/
│   ├── auth/
│   └── ui/
├── lib/
│   ├── credits.ts
│   └── supabase/
├── supabase/
│   └── migrations/
│       └── 001_create_credits.sql
├── .env.local
├── package.json
└── README.md
```

## Core Architecture

### Authentication

Supabase Auth manages signup, login, sessions, and password recovery. Protected pages and API routes verify the authenticated user server-side.

### Credit System

Each user has a record in the `credits` table.

```text
New user
   ↓
Credit record created
   ↓
User sends message
   ↓
Check credits
   ↓
Deduct 1 credit atomically
   ↓
Generate AI response
```

Credit deduction uses a PostgreSQL RPC function to prevent race conditions from simultaneous requests.

### Chat Flow

```text
User
 ↓
/api/chat
 ↓
Authenticate user
 ↓
Check credits
 ↓
Get conversation history
 ↓
Call Groq
 ↓
Save messages
 ↓
Return AI response + credits
 ↓
Update chat UI
```

### Security

Sensitive operations remain server-side:

* Groq API key is stored in `.env.local`
* Authentication is verified on the server
* Credits cannot be directly modified by users
* Database access is protected with RLS
* Credit deduction uses an atomic PostgreSQL function

## Database

### `credits`

Stores user credit balances.

Main fields:

* `id`
* `user_id`
* `user_email`
* `credits_count`
* `reset_at`
* `updated_at`

### `messages`

Stores conversation history.

Main fields:

* `id`
* `user_id`
* `role`
* `content`
* `created_at`

Users can only access their own records through RLS policies.

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GROQ_API_KEY=your_groq_api_key
```

Never expose `GROQ_API_KEY` in client-side code.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project and add the required environment variables.

### 3. Run the database migration

Run:

```text
supabase/migrations/001_create_credits.sql
```

in the Supabase SQL Editor.

### 4. Start the application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Testing

Verify:

* User signup/login works
* Protected routes redirect unauthenticated users
* New users receive credits
* Sending a message consumes 1 credit
* Groq returns a response
* Chat history is saved
* Credits update in the UI
* Zero-credit users cannot send messages
* Clear Thread removes the visible conversation

## Main Files

| File                                         | Purpose                                                    |
| -------------------------------------------- | ---------------------------------------------------------- |
| `app/chatbot/page.tsx`                       | Protected chatbot page                                     |
| `app/chatbot/chat-interface.tsx`             | Chat UI and client-side state                              |
| `app/api/chat/route.ts`                      | Authentication, Groq calls, credits, and message storage |
| `app/api/credits/route.ts`                   | Returns current credit balance                             |
| `lib/credits.ts`                             | Authentication and credit helpers                          |
| `lib/supabase/server.ts`                     | Server-side Supabase client                                |
| `lib/supabase/client.ts`                     | Browser Supabase client                                    |
| `supabase/migrations/001_create_credits.sql` | Database tables, RLS, triggers, and RPC functions          |

## Summary

**Meridian** is a secure full-stack AI workspace where authenticated users receive limited credits and spend one credit per AI message. Next.js handles the application, Supabase manages authentication and data, PostgreSQL provides atomic credit operations, and Groq generates AI responses.