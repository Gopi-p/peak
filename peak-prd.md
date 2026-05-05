# Peak — Product Requirements Document

**Version:** 0.1 (Draft)
**Owner:** Gopi
**Last updated:** April 30, 2026
**Status:** Planning

---

## 1. Executive Summary

**Peak** is a personal, mobile-first workout tracking web app built for a single user. It captures every set of every workout, suggests scientifically-backed exercises based on the muscles being trained, and surfaces analytics that drive progressive overload and balanced muscle development.

Unlike commercial fitness apps that assume preset weekly splits, Peak is built for a flexible, in-the-moment training style — the user decides which muscles to train *as the session unfolds*, including mid-session switches and 2–3 muscle combinations per day. The app's job is to track this fluid behaviour, give intelligent suggestions, and tell the user whether their evolving pattern is balanced.

### Tagline (working)
*"Log every rep. Climb every peak."*

---

## 2. Goals & Non-Goals

### Goals
1. **Frictionless logging** — the app must not slow down a workout. Every interaction is one or two taps.
2. **Intelligent suggestions** — when a muscle is selected, the app offers the most effective exercises for it, ranked by scientific evidence.
3. **Progressive overload guidance** — show last session's numbers and suggest the next target (weight or reps).
4. **Volume & balance analytics** — weekly view of which muscles are over- or under-trained.
5. **Combination insight** — flag whether the user's chosen muscle pairings (e.g., chest + triceps + shoulders) are physiologically sensible.
6. **Personal-only** — no social, no sharing, no public feed. One user. One database. One purpose.

### Non-Goals (for v1)
- Multi-user support, accounts, or auth flows beyond a single login.
- Cardio tracking (treadmill, cycling, etc.) — strength training only.
- Nutrition or calorie tracking.
- Wearable / Apple Watch integration.
- Social features, sharing, leaderboards.
- Native iOS app — the PWA is the deliverable.

---

## 3. Target User

**N = 1.** Gopi, the sole user.

### Context of use
- **Where:** Inside a gym, between sets.
- **Device:** iPhone, used as a PWA installed to the home screen.
- **Hands:** Often sweaty, sometimes one-handed (other hand on equipment).
- **Time pressure:** 30–90 seconds between sets — logging must finish well within rest time.
- **Lighting:** Variable; gym is bright, app should be readable in both light and dark.

### Implication for design
Tap targets must be large. Number entry must use a custom numeric keypad (not the iOS keyboard, which is slow). The most-used screen — *log a set* — must be the first thing the user sees after pressing "Start workout."

---

## 4. Core Concepts (Domain Model)

| Concept | Definition |
|---|---|
| **Session** | A single workout, with a start time, end time, and one or more muscle groups trained. |
| **Muscle Group** | A primary muscle being targeted (Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Core, Forearms, Traps). |
| **Exercise** | A specific movement (e.g., "Barbell Bench Press"). Linked to one or more muscle groups (primary + secondary). |
| **Equipment** | The tool used (Barbell, Dumbbell, Cable, Machine, Bodyweight, etc.). Some exercises support multiple. |
| **Set** | A single bout: weight × reps. Optionally tagged with RPE (Rate of Perceived Exertion, 1–10). |
| **Exercise Entry** | A grouping of sets for one exercise within one session. Holds 1+ sets. |
| **Volume** | Weight × reps, summed. Primary unit of training stress. |

A **Session** contains many **Exercise Entries**, which each contain many **Sets**. A Session is also tagged with the **Muscle Groups** it touched (derived from the exercises chosen, but the user can also explicitly declare them when starting/switching mid-session).

---

## 5. Key Behaviour: Fluid Muscle Selection

This is Peak's signature feature and what differentiates it from MacroFactor, Hevy, Strong, etc.

**Standard apps:** "Pick a routine — Push Day. Here are the exercises."

**Peak:** "Start a session. Pick a muscle. Pick an exercise. Log it. When you're ready for the next exercise, pick a muscle again — same one or a different one. Switch as many times as you want."

### Why this matters
Gopi's training style does not follow a fixed split. A session might be Chest → Triceps → Shoulders, or Back → Biceps → Core, or just Quads + Glutes. The app must accommodate this without forcing a pre-planned routine.

### How the app supports it
- After every exercise is completed, a "What's next?" screen prompts: *Same muscle, different muscle, or finish?*
- The session's muscle list grows organically.
- At the end of the session, the app shows: "Today you trained X, Y, Z. That's a [common pairing | unusual pairing]. Here's what science says about this combination."

---

## 6. Feature Set

### 6.1 MVP (Phase 1 — what gets built first)

1. **Start / End Session** — one-tap session start, time auto-tracked.
2. **Muscle picker** — visual grid of 12 muscle groups.
3. **Exercise picker** — filtered list of exercises for the chosen muscle, ranked by evidence (see §9).
4. **Set logger** — weight, reps, optional RPE. Custom numeric keypad. "Same as last set" quick action.
5. **Rest timer** — auto-starts after each set is logged. Configurable default (90s), per-set adjustable.
6. **Session summary** — total volume, muscles trained, time, sets completed.
7. **Exercise history** — for any exercise, see all past sets with date, weight, reps.
8. **Last-session reference** — when starting an exercise, show "last time: 60kg × 8, 8, 7."
9. **Pre-seeded exercise database** — 80–120 exercises covering all major muscle groups, each tagged with primary/secondary muscles, equipment, and an evidence rating.
10. **Local-first with sync** — works offline, syncs to MongoDB Atlas when online (gym Wi-Fi is unreliable).

### 6.2 Phase 2 (after MVP is stable)

11. **Weekly analytics dashboard** — sets per muscle group per week, trend lines, volume progression.
12. **Progressive overload suggestions** — "Last time you hit 60kg × 8,8,7. Try 62.5kg × 8 today" (rule-based, not ML).
13. **Muscle balance heatmap** — front/back human silhouette colored by training volume over the last 7/14/30 days.
14. **Combination analyzer** — when a session's muscles are finalized, flag the pairing as Push / Pull / Legs / Upper / Full Body / Unusual, with a note on synergy.
15. **PR (Personal Record) tracking** — auto-detect when a weight × reps combination beats prior best. Subtle confetti.

### 6.3 Phase 3 (nice-to-have)

16. **Goal setting** — pick a goal (e.g., "Bench Press 100kg," "Train each muscle 10+ sets/week"). Dashboard shows progress.
17. **Plate calculator** — "60kg on a 20kg bar = 2× 20kg + 2× 0kg" — for fast plate math at the rack.
18. **Exercise notes** — free-text per exercise (e.g., "use the cambered bar, second machine from left").
19. **Deload detection** — if weekly volume drops > 30%, ask if it was intentional.
20. **Body weight log** — single optional metric, plotted alongside lift progression.

---

## 7. User Flows

### 7.1 Flow: Start a workout (the happy path)

```
Home screen
   ↓ tap "Start workout"
Session screen (timer running, 0 exercises)
   ↓ tap "Add exercise"
Pick muscle (grid of 12)
   ↓ tap "Chest"
Pick exercise (suggested list, ranked by evidence)
   ↓ tap "Barbell Bench Press"
Set logger
   - Shows last session: "60kg × 8, 8, 7"
   - Big numeric keypad
   ↓ enter 62.5 / 8 / RPE 8 → tap "Log set"
Rest timer (90s, auto-started)
   ↓ optional: tap "Add another set" or wait
   ↓ when done with this exercise, tap "Next exercise"
What's next? screen
   ↓ "Same muscle" | "Different muscle" | "Finish session"
   ↓ tap "Different muscle" → back to muscle picker
... (loop)
   ↓ tap "Finish session"
Session summary
   - Time, muscles trained, total volume
   - "You trained Chest + Triceps — that's a classic Push pairing."
   - Compare to last similar session (if exists)
```

### 7.2 Flow: View analytics (weekly)

```
Home screen
   ↓ tap "Insights" tab
Weekly dashboard
   - Sets per muscle group (bar chart)
   - Volume trend (line chart, last 8 weeks)
   - Muscle heatmap (front/back silhouette)
   - "Undertrained this week: Calves (0 sets), Rear Delts (2 sets)"
```

### 7.3 Flow: Look up a past exercise

```
Home → "History" tab
   ↓ search or pick exercise
Exercise detail
   - All-time PR
   - Last 10 sessions with this exercise
   - Estimated 1RM trend (Epley formula)
```

---

## 8. Information Architecture

### Navigation (bottom tab bar, 4 tabs)

1. **Today** — start/resume a session, see today's progress.
2. **Insights** — weekly dashboard, muscle balance, trends.
3. **History** — browse past sessions and exercises.
4. **Library** — exercise database, edit notes, mark favorites.

### Page inventory

| Page | Purpose | Phase |
|---|---|---|
| Home / Today | Entry point, start workout | MVP |
| Active session | Log sets, manage exercises | MVP |
| Muscle picker | Grid of muscle groups | MVP |
| Exercise picker | Filtered, ranked exercise list | MVP |
| Set logger | Weight / reps / RPE entry | MVP |
| Session summary | End-of-workout recap | MVP |
| History list | Past sessions | MVP |
| Session detail | Read-only view of a past session | MVP |
| Exercise history | Per-exercise progression | MVP |
| Weekly insights | Charts and balance | Phase 2 |
| Muscle heatmap | Visual front/back balance | Phase 2 |
| Library | Exercise catalog, edit notes | MVP (read) / Phase 3 (edit) |
| Settings | Default rest timer, units, theme | MVP |

---

## 9. Exercise Database & Scientific Backing

### Source strategy
The exercise library is **pre-seeded** at app launch and shipped with the codebase (not user-editable in v1, except for personal notes).

### Per-exercise data
- Name (e.g., "Barbell Bench Press")
- Primary muscle group(s)
- Secondary muscle group(s)
- Equipment (Barbell / Dumbbell / Cable / Machine / Bodyweight / Other)
- Movement pattern (Press / Pull / Squat / Hinge / Carry / Isolation)
- Evidence rating (1–5 stars) — based on EMG studies and meta-analyses (Schoenfeld et al., Stronger By Science syntheses, etc.)
- Short cue (one sentence, e.g., "Tuck elbows ~45° from torso")
- Difficulty (Beginner / Intermediate / Advanced)

### Sources (to cite in About screen)
- Schoenfeld, B. — *Science and Development of Muscle Hypertrophy*
- Stronger By Science — exercise selection articles
- Renaissance Periodization — MEV/MRV per muscle group guidance
- ExRx.net — biomechanics reference

### Ranking algorithm (MVP, simple)
When the user picks a muscle, exercises are sorted by:
1. **Evidence rating** (descending)
2. **Personal frequency** (how often the user has done it — favors variety by gently demoting top-3 most-used in last 14 days)
3. **Alphabetical** (tiebreaker)

A "Show all" toggle reveals the full list.

---

## 10. Analytics & Insights

### MVP-level (Phase 1)
- **Per-session:** total volume, sets, time, muscles trained.
- **Per-exercise:** chronological history, estimated 1RM (Epley: `1RM ≈ weight × (1 + reps/30)`).

### Phase 2 metrics

| Metric | Definition | Why it matters |
|---|---|---|
| **Weekly sets per muscle** | Count of working sets (excluding warmups) per muscle group, per week. | Hypertrophy research suggests 10–20 sets/muscle/week is the sweet spot. |
| **Volume tonnage** | Σ(weight × reps) per muscle, per week. | Tracks total mechanical stress over time. |
| **Frequency** | Number of sessions per muscle per week. | 2× per week per muscle is generally optimal. |
| **Intensity load** | Average RPE per session. | Detects under- or over-reaching. |
| **Estimated 1RM trend** | Epley estimate per main lift, plotted weekly. | Strength progression at a glance. |

### Phase 2 insights (rules-based, not ML)
- *"You've trained Chest 4× this week and Back 1×. Your push:pull ratio is skewed."*
- *"You haven't trained Legs in 9 days."*
- *"Your bench press estimated 1RM has plateaued for 3 weeks. Consider a deload."*
- *"You hit 18 sets for Chest this week — at the upper end of productive volume."*

### Combination analyzer (Phase 2)
End-of-session classification of muscle pairings:

| Combination | Classification | Note |
|---|---|---|
| Chest + Triceps + Shoulders | Classic Push | Synergistic; triceps assist pressing. |
| Back + Biceps | Classic Pull | Synergistic; biceps assist pulling. |
| Quads + Hamstrings + Glutes | Leg day | Standard leg training. |
| Chest + Back | Antagonist superset day | Time-efficient, no fatigue interference. |
| Chest + Biceps | Unusual | Not synergistic; check if intentional. |
| Legs + Upper isolation (e.g., Quads + Biceps) | Mixed | Common for bro-splits; viable but unusual. |

---

## 11. UX & Visual Design Principles

### Principles
1. **One-thumb operation.** Bottom-anchored primary actions.
2. **Numeric input is sacred.** Never use the OS keyboard for weight/reps. Custom keypad always.
3. **Last-time context is everywhere.** When logging a set, the previous session's numbers are visible without tapping.
4. **Dark mode default.** Gyms are bright; OLED on iPhone preserves battery and reduces glare in mirrored rooms.
5. **No empty states without action.** Every empty screen has a clear "do this next" CTA.
6. **Speed over beauty.** Animations < 200ms. No skeleton loaders longer than necessary.

### Visual style (working direction)
- **Type:** Inter or SF Pro for UI; large numerics (weight, reps) in a tabular display face.
- **Color:** Near-black background, single accent color (deep amber or electric green — TBD), generous whitespace.
- **Iconography:** Lucide or Phosphor — clean line icons.
- **Density:** Low. One primary action per screen.

---

## 12. Technical Considerations (high-level)

> Detailed architecture goes in a separate Engineering Design doc. This section captures product-relevant constraints only.

| Area | Direction |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui — same stack as ShipDesk for consistency. |
| **Hosting** | Vercel (free tier sufficient for single-user). |
| **Database** | MongoDB Atlas (free tier; existing personal cluster). |
| **Auth** | NextAuth.js, email/password, single user — locked to your email. |
| **PWA** | Installable to iOS home screen; service worker for offline logging; background sync on reconnect. |
| **Offline-first** | Sets logged locally (IndexedDB) and synced when online. Gym Wi-Fi is unreliable. |
| **Notifications** | Rest timer uses Web Notifications API + audio cue. iOS PWA notifications limited — fallback to in-app + audio. |
| **Charts** | Recharts (lightweight, already familiar). |

---

## 13. Phased Roadmap

| Phase | Scope | Estimated effort |
|---|---|---|
| **Phase 0 — Foundation** | Repo setup, auth, schema, exercise database seeding, PWA shell. | 1 week |
| **Phase 1 — MVP** | Sessions, sets, muscle/exercise pickers, history, offline sync. | 2–3 weeks |
| **Phase 2 — Insights** | Weekly dashboard, muscle balance, progressive overload suggestions, combination analyzer. | 2 weeks |
| **Phase 3 — Polish** | Goals, plate calculator, deload detection, advanced settings. | 1–2 weeks |

Total to a feature-complete v1: **~6–8 weeks of evening/weekend work.**

---

## 14. Open Questions (defaults assumed for now — confirm or override)

| # | Question | Working assumption |
|---|---|---|
| Q1 | Post-workout analytics depth | Today's summary + comparison to last similar session + week-to-date rollup. |
| Q2 | Muscle suggestion strategy | Fresh picks each day + warnings if a muscle is being overtrained relative to last 7 days. |
| Q3 | Progressive overload nudge style | Auto-suggest based on last performance and RPE — show a target, never force it. |
| Q4 | Units | kg primary, lbs toggle in settings. |
| Q5 | RPE tracking | Optional per set (skippable, not required). |
| Q6 | Warmup sets | Toggle per set: "Warmup" sets logged but excluded from volume math. |
| Q7 | Failure / drop sets | Tag-based: "to failure," "drop set" — appended to a set, included in volume. |
| Q8 | Rest timer default | 90s, configurable per exercise. |
| Q9 | Multi-device | Single device for v1 (your iPhone). Sync via DB if you ever log in elsewhere. |
| Q10 | Backup / export | Manual JSON export from settings; weekly auto-backup to email (Phase 3). |

---

## 15. Success Criteria

You'll know Peak is working when:
1. You log every set of every workout for 4 weeks straight without abandoning the app.
2. You catch and fix at least one muscle imbalance you didn't know you had.
3. You hit a measurable progression on at least 3 lifts within the first 8 weeks.
4. Logging a set takes under 5 seconds, end-to-end.

---

## 16. Next Steps

1. **You review this PRD** — flag anything missing, wrong, or to drop.
2. **Resolve Q1–Q10** — or accept the defaults.
3. **Lock the MVP scope** — exactly what ships in Phase 1.
4. **Move to the Engineering Design doc** — schema, API routes, sync logic, PWA setup.
5. **Wireframes** — low-fi sketches of the 8 MVP screens before any code.
6. **Coding plan** — break MVP into ticket-sized work items.

---

*End of PRD v0.1.*
