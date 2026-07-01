# AI Workplace Productivity Assistant — Build

The scaffold, database, auth middleware, AI gateway, server functions, chat streaming route, and shell components are already in place. This plan finishes the remaining UI so the app is fully usable.

## Remaining work

**Auth & layout**
- `src/routes/auth.tsx` — email/password sign-in + sign-up (tabbed), redirects to `/` on success.
- Confirm `src/routes/_authenticated/route.tsx` gate + `AppShell` wrap (already present).

**Dashboard** (`_authenticated/index.tsx`)
- Greeting with user email, grid of 5 tool cards (icon, name, description, link), recent activity from `listGenerations`.

**Tool pages** — one per tool, all using a shared `ToolWorkbench` pattern:
- `email.tsx` — inputs: recipient, tone (select), purpose, key points (textarea).
- `meetings.tsx` — input: notes (large textarea).
- `tasks.tsx` — inputs: goal, deadline, context.
- `research.tsx` — inputs: topic, depth (select), focus questions.

Each page: form on the left, editable markdown output on the right with Copy / Save-edit / Delete, history list below, persistent Responsible-AI disclaimer footer.

**Chat**
- `_authenticated/chat/route.tsx` — two-pane layout with thread list sidebar (list/create/rename/delete via `chat-threads.functions`), Outlet on right.
- `_authenticated/chat/index.tsx` — empty state that creates a new thread and navigates to it.
- `_authenticated/chat/$threadId.tsx` — already implemented (AI SDK `useChat`, streams from `/api/chat`, hydrates history, disclaimer under composer).

**Root wiring**
- Ensure `src/start.ts` registers `attachSupabaseAuth` in `functionMiddleware` so protected server fns receive the bearer.
- Ensure `__root.tsx` has `onAuthStateChange` → `router.invalidate()` (identity events only).

## Verification
- `tsgo` typecheck.
- Manual: sign up → dashboard → run each tool → open chat → send a message → refresh thread.

## Notes
- All AI calls go through Lovable AI Gateway (`google/gemini-3-flash-preview`).
- All outputs render via `Markdown` component and are editable in a textarea before save.
- Disclaimer appears on every tool page and chat.
