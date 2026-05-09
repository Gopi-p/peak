# Peak — agent guide

Personal mobile-first PWA workout tracker, single user, Next.js 15 App Router.
The full product spec lives in `peak-prd.md`. The visual design source is the
Stitch project "Peak Workout Tracker" (project ID `2710955204697556366`,
"Midnight Studio" theme).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind 3.4 + shadcn-style primitives in `components/ui/`
- MongoDB Atlas via Mongoose (`lib/db/`)
- **No auth.** Single user, single device. The app opens straight to `/today`.
  Every document carries an `ownerEmail` field set to `process.env.PEAK_OWNER`
  (default `"peak"`) for hygiene only — there is no login.
- Zod (`lib/validations.ts`) for every request body
- Recharts for analytics visuals
- Dexie (`lib/offline/db.ts`) for offline IndexedDB queue + service worker (`public/sw.js`)

## Commands

```bash
npm run dev         # localhost:3000
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
```

`.env.local` keys: `MONGODB_URI` (required), `PEAK_OWNER` (optional, defaults
to "peak").

## Layout

```
app/
  (app)/                # authenticated routes (group)
    today/              # home — start workout, week summary
    session/[id]/       # active session, set logger, muscle/exercise pickers
    history/            # past sessions
    library/            # exercise database
    insights/           # weekly dashboard, balance, deload alert
    goals/              # goal tracking (Phase 3)
    plate-calc/         # plate calculator (Phase 3)
    bodyweight/         # body weight log (Phase 3)
    settings/
  api/
    sessions/           # POST start, GET list
    sessions/[id]/...   # finish, entries, sets
    settings/
    goals/
    bodyweight/
    sync/sessions/      # offline drain endpoint
components/
  ui/                   # button, card, input, badge — shadcn-style
  peak/                 # domain-specific (numeric keypad, stepper, muscle grid, charts, etc.)
lib/
  constants.ts          # MUSCLE_GROUPS, VOLUME_GUIDANCE (MEV/MAV/MRV)
  exercises.ts          # loader for data/exercises.json
  validations.ts        # Zod schemas
  session-guard.ts      # requireUser() — returns owner identifier (no auth)
  db/
    connect.ts          # mongoose singleton
    models.ts           # Session, BodyWeight, Goal, PersonalRecord, Settings
  offline/
    db.ts               # Dexie schema
    sync.ts             # drainQueue()
  analytics/
    volume.ts           # rollupByWeek, undertrainedMuscles, sessionVolume
    overload.ts         # suggestNext() — RPE-aware progression
    pr.ts               # checkPr() — weight-for-reps + estimated 1RM
    deload.ts           # detectDeload() — > 30% week-over-week drop
    combo.ts            # classifyCombination() — Push/Pull/Legs/etc.
    plate-calc.ts
data/
  exercises.json        # seeded ~95 exercises with evidence ratings
public/
  manifest.webmanifest
  sw.js
  icon.svg
```

## Conventions

- **Single user, no auth.** Every collection has `ownerEmail` set from
  `PEAK_OWNER` (default `"peak"`). Use `requireUser()` at the top of every
  handler/page that needs the owner identifier.
- **Offline-first writes.** Set logging always goes via the Dexie queue first;
  the sync worker drains to `/api/sync/sessions`. The non-offline path
  (`/api/sessions/[id]/sets`) is used directly when online.
- **Tabular numerics.** Apply `.num` (defined in globals.css) to any number the
  user reads at a glance: weights, reps, volume, timer.
- **Tap targets.** Anything tapped between sets is at least 56px tall (`h-tap`
  or the `xl` button size).
- **Styling.** Stitch "Midnight Studio" — dark background `#131316`, soft gold
  primary `#D4AF37`, Lexend body, Epilogue display. CSS variables in
  `globals.css`; Tailwind tokens in `tailwind.config.ts`.

## Domain notes

- **Volume math** counts only working sets (`!isWarmup`). Secondary muscle
  contributions are weighted at 0.5 — common heuristic.
- **Combination classifier** uses fixed muscle groupings (Push = Chest /
  Shoulders / Triceps; Pull = Back / Biceps / Traps / Forearms; Legs = Quads /
  Hams / Glutes / Calves) — see `lib/analytics/combo.ts`.
- **Progressive overload** is RPE-aware when the user logs RPE; otherwise it
  compares to last session and bumps weight if all reps were hit.
- **PR detection** runs server-side on every working set save and writes to the
  `PersonalRecord` collection. The set logger flashes a confetti pill when
  triggered.
- **Deload detection** flags > 30% week-over-week total volume drop on the
  Insights dashboard.

## What not to do

- Don't add multi-user features. `ownerEmail` is enough; do not introduce
  `User` collections or sign-up flows. The PRD locks single-user.
- Don't ship UI that opens the iOS keyboard for weight/reps. Use
  `NumericKeypad` or `Stepper`.
- Don't add cardio, nutrition, or social features.
- Don't let analytics drift from rules to ML.

## Dev workflow

1. `cp .env.example .env.local`, fill in `MONGODB_URI`.
2. `npm run dev`, browse `http://localhost:3000` — app opens straight to Today.
3. PWA install: open in Safari iOS, "Add to Home Screen."

## Related files

- `peak-prd.md` — product requirements (canonical)
- `data/exercises.json` — seeded exercise database (canonical)
