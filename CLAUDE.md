# JazFit

Personal fitness tracking web app for Jazmin. Mobile Safari on iPhone is the primary (only) client.

## Stack
- **Framework:** Next.js 14+ (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS (dark theme only, coral accent `#FF6B6B`)
- **Database:** Supabase (Postgres + Auth)
- **Deploy:** Vercel (auto-deploy from `main`)

## Architecture Decisions
- **Server Actions** for all data mutations (no API routes)
- **Single user** — Jazmin is the only user. Simple email/password auth, basic RLS on `user_id`
- **Optimistic updates** in active workout mode — UI never waits for DB writes
- **`useReducer` state machine** for active workout flow with `sessionStorage` crash recovery
- **No state management library** — React state + Server Components cover everything

## Database Schema
Tables: `profiles`, `exercises`, `user_exercises`, `workout_sessions`, `exercise_logs`, `set_logs`, `body_measurements`
- Full migration: `supabase/migrations/001_initial_schema.sql`
- RLS enabled on all tables, policies use `auth.uid() = user_id`

## Key Files
- `src/lib/workout-engine.ts` — Workout routing algorithm + progressive overload engine
- `src/lib/hooks/use-active-workout.ts` — Reducer state machine for the active workout screen
- `src/lib/supabase/` — Client (browser), server (cookies), middleware helpers
- `src/actions/` — Server Actions for auth, onboarding, workout, exercises
- `scripts/seed-exercises.ts` — Default exercise library (~67 exercises)

## Design Conventions
- **STYLE_GUIDE.md is the source of truth for all aesthetic decisions** — always read it before making visual changes
- Aesthetic: soft romantic warmth, dusty rose palette, DM Serif Display headings, glassmorphism
- Light mode default (`#FBF0F0` cream blush bg, `#C4808E` dusty rose accent)
- **RESTYLE IN PROGRESS** — token swap from dark/coral to light/dusty-rose is planned but not yet applied
- Mobile-first, iPhone Safari viewport (390px)
- All touch targets min 48px (`min-h-12`)
- Safe-area padding for notch/dynamic island
- PWA meta tags for home screen bookmark experience
- Large text, high contrast — readable at arm's length in a gym

## Project Structure
```
src/
  app/           # App Router pages
    (app)/       # Authenticated route group
    login/       # Login page
    auth/        # Auth callback
  components/
    ui/          # Primitive components (button, card, badge, etc.)
    workout/     # Workout-specific components
    onboarding/  # Onboarding components
  lib/
    supabase/    # Supabase client setup
    hooks/       # React hooks (wake lock, rest timer, active workout)
  actions/       # Server Actions
```

## Current Phase
**Phase 1:** Core workout loop
- Smart workout routing (suggest today's muscle group)
- Exercise pool (onboarding + gym-specific selection)
- Active workout mode (full-screen gym experience)
- Set logging + progressive overload
- Workout history

**Phase 2 (not started):** Body measurements tracker + trend charts

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run seed` — Seed exercise library to Supabase
