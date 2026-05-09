# Peak

Personal mobile-first PWA workout tracker. Single user, single device, no auth.
Designed to log every set inside the gym between rest periods on iPhone.

> Log every rep. Climb every peak.

The full product spec lives in [`peak-prd.md`](peak-prd.md). The visual design
source is the Stitch project "Peak Workout Tracker" (Midnight Studio theme,
project ID `2710955204697556366`).

## What it does

- **Frictionless logging** — start a session, pick a muscle, pick an exercise,
  tap weight/reps with a custom keypad, log set. Auto rest timer. Repeat.
- **Fluid muscle selection** — change muscles mid-session. The combination
  classifier flags the day as Push / Pull / Legs / Upper / Mixed at the end.
- **Progressive overload** — RPE-aware suggestion for next session's weight
  and reps. Rule-based, not ML.
- **PR detection** — confetti pill flashes when a working set beats a prior
  weight-for-reps or estimated 1RM record.
- **Weekly volume analytics** — sets per muscle (with MEV / MAV / MRV
  thresholds), volume trend, deload alert if week-over-week volume drops > 30 %.
- **Goals & body weight** — optional lift / sets / frequency / weight goals.
  Body-weight log with trend.
- **Offline-first** — sets are written to a Dexie queue first; the worker
  drains them to MongoDB Atlas when the network comes back.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + Turbopack |
| Language | TypeScript |
| UI | React 19, Tailwind 3.4, shadcn-style primitives, Radix |
| Database | MongoDB Atlas via Mongoose |
| Validation | Zod |
| Charts | Recharts |
| Offline | Dexie (IndexedDB) + service worker |
| PWA | hand-rolled `public/sw.js` + `manifest.webmanifest` |

## Auth model

There is none. Single user, single device. Every document carries an
`ownerEmail` field set to `process.env.PEAK_OWNER` (default `"peak"`) for
data-layer hygiene only — there is no login. `lib/session-guard.requireUser()`
returns the constant owner.

## Quick start

```bash
cp .env.example .env.local
# fill in MONGODB_URI (Atlas SRV string or mongodb://localhost:27017/peak)

npm install
npm run dev          # http://localhost:3000 → /today
```

The app opens straight to the Today tab. There's no login.

To install as a PWA: open in Safari on iOS, share menu, "Add to Home Screen."

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (Turbopack)
npm run start        # serve production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

## Environment variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `MONGODB_URI` | yes | — | MongoDB connection string |
| `PEAK_OWNER` | no | `peak` | Stamped on every document as `ownerEmail` |

## Project layout

```
app/
  (app)/                   route group, bottom tab UI
    today/                 home — start workout, weekly summary
    session/[id]/...       active session, set logger, pickers, summary
    history/               past sessions list + detail (with delete)
    library/               exercise catalogue + per-exercise progression
    insights/              weekly dashboard, muscle balance, deload alert
    goals/                 goal CRUD with progress bars
    bodyweight/            body-weight log + trend
    plate-calc/            plate calculator
    settings/              rest timer, RPE toggle
    layout.tsx             ToastProvider, OnlineIndicator, BottomTabBar
  api/
    sessions/              POST start, GET list, DELETE soft-delete
    sessions/[id]/...      finish, entries, sets (POST + DELETE)
    goals/                 CRUD
    bodyweight/            CRUD
    settings/              GET / PATCH
    sync/sessions/         offline drain endpoint (idempotent upsert)
components/
  ui/                      button, card, input, badge — shadcn-style
  peak/                    domain primitives — keypad, stepper, charts,
                           toast, confirm-dialog, back-bar, skeletons,
                           muscle grid, rest timer, PR flash
lib/
  constants.ts             MUSCLE_GROUPS, VOLUME_GUIDANCE (MEV/MAV/MRV)
  exercises.ts             loader for data/exercises.json
  validations.ts           Zod schemas (every API request body validated)
  api-utils.ts             parseJson() — uniform 400 error responses
  session-guard.ts         requireUser() — returns the constant owner
  db/
    connect.ts             mongoose singleton
    models.ts              Session, BodyWeight, Goal, PR, Settings,
                           soft-delete + compound indexes
  offline/
    db.ts                  Dexie schema
    sync.ts                drainQueue() — idempotent upserts to /api/sync
  analytics/
    volume.ts              rollupByWeek, undertrainedMuscles
    overload.ts            suggestNext() — RPE-aware progression
    pr.ts                  checkPr() — weight-for-reps + estimated 1RM
    deload.ts              detectDeload() — > 30 % WoW drop
    combo.ts               classifyCombination() — Push/Pull/Legs/etc.
    plate-calc.ts          plates per side
data/
  exercises.json           ~98 seeded exercises with evidence ratings
public/
  sw.js                    service worker — app shell + offline fallback
  manifest.webmanifest     PWA manifest
```

## Conventions

- **Single user, no auth.** Every collection is partitioned by `ownerEmail`.
  Use `requireUser()` at the top of every handler / page that needs the owner.
- **Offline-first writes.** Set logging writes to the Dexie queue first; the
  sync worker drains to `/api/sync/sessions`. The non-offline path
  (`POST /api/sessions/[id]/sets`) is used directly when online.
- **Tabular numerics.** Apply `.num` (defined in `globals.css`) to any
  number the user reads at a glance: weights, reps, volume, timer.
- **Tap targets.** Anything tapped between sets is at least 56 px tall
  (`h-tap` or the `xl` button size).
- **Numeric input.** Never the iOS keyboard for weight / reps — the
  `Stepper` and `NumericKeypad` are the only input paths.
- **Soft delete.** Sessions / goals / body-weight entries are hidden via
  `deletedAt`; sets within an active session are hard-pulled with an Undo
  toast for in-flow correction.
- **Validation.** Every POST / PATCH body is parsed via
  `lib/api-utils.parseJson(req, schema)`, which returns a clean
  `400 {"error": "field: message"}` on bad input.

## Domain notes

- **Volume math** counts only working sets (`!isWarmup`). Secondary muscle
  contributions are weighted at 0.5 (common heuristic).
- **Combination classifier** uses fixed muscle groupings:
  Push (Chest / Shoulders / Triceps), Pull (Back / Biceps / Traps / Forearms),
  Legs (Quads / Hams / Glutes / Calves) — see `lib/analytics/combo.ts`.
- **Progressive overload** is RPE-aware when the user logs RPE; otherwise
  it compares to last session and bumps weight if all reps were hit.
- **PR detection** runs server-side on every working-set save and writes to
  the `PersonalRecord` collection. The set logger flashes a confetti pill
  when triggered.
- **Deload detection** flags > 30 % week-over-week volume drop on Insights.

## Deploying

The app is built for Vercel + MongoDB Atlas (free tier of each is enough
for one user). Connect the GitHub repo, set `MONGODB_URI` in Project
Settings → Environment Variables, deploy.

If your domain is registered with another provider (e.g. Cloudflare), keep
DNS there and add Vercel's records (`A` for apex, `CNAME` for subdomain).
On Cloudflare specifically, set the proxy to **DNS only** (gray cloud) so
Vercel can terminate TLS without conflict.

## What not to do

- Don't add multi-user features. `ownerEmail` is enough; no `User`
  collection, no sign-up flow. The PRD locks single-user.
- Don't ship UI that opens the iOS keyboard for weight / reps. Use
  `NumericKeypad` or `Stepper`.
- Don't add cardio, nutrition, or social features.
- Don't let the analytics drift from rules to ML.
- Don't connect Flutter (or any future client) directly to MongoDB Atlas
  — credentials would ship in the binary. Always go through
  `app/api/...`.

## Licence

Private project. Not for distribution.
