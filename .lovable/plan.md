# AI Workplace Productivity Assistant

A clean Notion-style SaaS app with five AI-powered tools, email/password auth, and per-user persistence via Lovable Cloud.

## Stack & setup
- Enable Lovable Cloud (Supabase) for auth + database
- Lovable AI Gateway (`google/gemini-3-flash-preview`) for all AI calls
- AI SDK + AI Elements for chat surface

## Auth
- Email/password sign-in/sign-up at `/auth`
- Protected app routes under `_authenticated/`
- Sign-out in sidebar

## Layout
- Collapsible sidebar (shadcn) with: Dashboard, Email Generator, Meeting Summarizer, Task Planner, Research Assistant, Chatbot
- Top bar with sign-out
- Responsible-AI disclaimer footer on every tool page

## Pages

**Dashboard (`/`)** — Greeting, grid of 5 tool cards with descriptions, recent activity list.

**Smart Email Generator (`/email`)** — Form: recipient, tone (professional/friendly/concise/persuasive), purpose, key points. Generates editable email (subject + body in textarea). Copy/save buttons. History list.

**Meeting Notes Summarizer (`/meetings`)** — Paste raw notes/transcript. Outputs editable: TL;DR, key decisions, action items (with owners), follow-ups. Save to history.

**AI Task Planner (`/tasks`)** — Input: goal + deadline + context. Outputs editable checklist of tasks with priority and estimated time. Save plan.

**AI Research Assistant (`/research`)** — Topic + depth (overview/deep-dive) + focus questions. Outputs editable structured report: summary, key findings, sources/considerations. Save.

**AI Chatbot (`/chat` and `/chat/$threadId`)** — Threaded chats in sidebar list; new-thread button; route-driven active thread; messages persisted per thread in DB. Built on AI Elements (Conversation, Message, PromptInput, Shimmer, MessageResponse with markdown).

All tool outputs render markdown and are editable in a textarea before saving.

## Database (Lovable Cloud)
- `profiles` (id→auth.users, display_name)
- `chat_threads` (id, user_id, title, updated_at)
- `chat_messages` (id, thread_id, user_id, role, parts jsonb, created_at)
- `generations` (id, user_id, tool enum, title, input jsonb, output text, created_at) — used by the 4 non-chat tools for history
- RLS scoped to `auth.uid()`; GRANTs to authenticated + service_role
- Trigger to auto-create profile on signup

## Server functions (`createServerFn` + `requireSupabaseAuth`)
- `generateEmail`, `summarizeMeeting`, `planTasks`, `researchTopic` — call AI Gateway, save to `generations`, return output
- `listGenerations(tool)`, `deleteGeneration(id)`
- `listThreads`, `createThread`, `deleteThread`, `loadThreadMessages`
- Chat streaming via `src/routes/api/chat.ts` server route using `streamText` + `toUIMessageStreamResponse({ originalMessages, onFinish })`; `onFinish` persists assistant message to the active thread

## Design (Notion-style light)
- Background `#ffffff`, surface `#f7f6f3`, text `#2f3437`, accent `#2383e2`
- Inter for body, light borders, generous whitespace, subtle hover states
- All colors via semantic tokens in `src/styles.css`
- Mobile responsive: sidebar collapses to icon strip / offcanvas on small screens

## Responsible AI
- Persistent footer disclaimer on every tool: "AI-generated content may be inaccurate. Review before use."
- Disclaimer also shown under chat composer

## Out of scope (v1)
- Real email sending / calendar integrations
- File uploads / OCR of meeting recordings
- Team workspaces / sharing
