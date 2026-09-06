# Gym Tracker

A personal-use mobile app to create workouts, log completed sessions, and track history/PRs per exercise. Built with React Native + Expo (Expo Router) + TypeScript, styled with NativeWind (Tailwind for RN) and a small shadcn-style local component library. Data is persisted to the user's own Google Drive as a single JSON document (via Drive API, `drive.file` scope), with AsyncStorage used as a local cache/offline buffer.

This file is the living source of truth for the project. It is organized by role, per the team process defined in `project_instruction.md`: **PO → DEV → QA**.

---

## PO — Product & System Design

### 1. Vision
Single-user mobile gym tracker. Three jobs to be done:
1. Create/manage reusable **workout templates** (exercises, target sets/reps/weight).
2. **Log** a completed session against a template (or freeform).
3. **Review** history and **PRs** per exercise, plus a motivating dashboard.

No auth/roles beyond "sign in with Google" to authorize Drive access — there is only one user.

### 2. Information Architecture (screens)
Bottom tab navigation (Expo Router), 3 tabs:

- **Dashboard** (`/`) — home screen
- **Workouts** (`/workouts`) — CRUD for templates, entry point to start a session
- **History** (`/history`) — sessions log + PRs report

A 4th, non-tab route handles **session logging** (`/workouts/[id]/log` or `/log/[sessionId]`), launched from Workouts via "Start Workout". It's a flow, not a tab, since it's a focused full-screen task (rest timer, set-by-set entry) rather than a browsing surface.

**Post-Workout Summary** (added after the v1 UX review): finishing a session no longer drops the user straight back on Dashboard with just a toast — it goes to a celebratory full-screen summary first (time trained as the hero stat, volume/sets/exercises as secondary stats, a distinct card for any new PR hit that session), with a "Done" action to return to Dashboard. This is a 5th route in the session-logging flow, not a tab.

#### Dashboard
- **This week** — progress ring/bar: sessions completed vs. weekly goal (goal is a simple user-set number, default 3/week).
- **Streak** — consecutive weeks (not days, since this is a gym app) with ≥1 completed session. Duolingo-style flame icon, minimal treatment (no overwrought animation).
- **Suggested workout for today** — the workout template least-recently completed (simple rotation over the user's templates); tapping it starts a session. If only one template exists, always suggest it (unless done today).
- **Monthly stats** — sessions completed, total volume (Σ weight×reps), new PRs this month.
- **Empty state** — no templates yet → "Create your first workout" CTA → Workouts/create.

#### Workouts
- List of workout templates (name, exercise count, last performed date).
- **Create/Edit**: name, optional description, ordered list of exercises, each with target sets/reps and optional target weight/rest seconds. Exercises come from a searchable library; user can add a custom exercise (name + muscle group) inline.
- **Delete**: confirm dialog (destructive).
- **Start Workout** → session logging flow, pre-filled with the template's exercises/targets; user can add/remove sets or exercises ad hoc during the session (logging what actually happened, not just the plan).
- **Empty state** — no templates → CTA "Create your first workout".

#### History
- **Sessions** tab/section: reverse-chronological list by date; tap → session detail (exercises, sets×reps×weight, duration, notes). Empty state → CTA "Log your first workout" (goes to Workouts).
- **PRs** tab/section: one row per exercise showing current best (max weight, and best estimated 1RM via Epley: `weight × (1 + reps/30)`); tap → PR progression over time (simple line/list). Empty state when no sessions logged yet.

### 3. Data Model
Single JSON document synced to Drive (`drive.file` scope — app-created file only, no broad Drive access). Local AsyncStorage mirrors it for offline reads/writes; a sync pass reconciles on app foreground/reconnect using `updatedAt` timestamps (last-write-wins, since this is single-user/single-device — no conflict UI needed for v1).

```ts
interface GymTrackerData {
  version: 1;
  settings: {
    weeklyGoal: number; // sessions/week, default 3
  };
  exercises: Exercise[];
  workouts: Workout[];       // templates
  sessions: WorkoutSession[]; // completed logs
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;      // free-form or from a small preset list
  isCustom: boolean;
  createdAt: string;        // ISO
}

interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

interface WorkoutExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;    // kg, optional
  restSeconds?: number;
}

interface WorkoutSession {
  id: string;
  workoutId?: string;       // undefined = freeform/ad hoc session
  date: string;             // ISO date
  startedAt: string;
  completedAt?: string;
  exercises: PerformedExercise[];
  notes?: string;
}

interface PerformedExercise {
  exerciseId: string;
  sets: PerformedSet[];
}

interface PerformedSet {
  setNumber: number;
  reps: number;
  weight: number;           // kg, 0 for bodyweight
}
```

PRs are **derived**, not stored: for each exercise, scan `sessions` for the max weight-at-any-rep and the max estimated 1RM. Recomputed client-side; cheap at personal-use data volumes.

### 4. Design System
- **Aesthetic** (revised after a v1 UX review — Strong, Strava, and Duolingo used as reference points, not cloned): still dark, still gamified in small doses, but denser and more tactile than the v1 flat-and-minimal treatment. Strong's fast, data-dense set-logging (tap-to-complete sets); Strava's bold hero numbers and a celebratory post-workout recap; Duolingo's chunky, tactile "pressed" buttons and streak/PR celebration — extending the existing purple palette, not replacing it. Full mockup (approved): the "Gym Tracker Redesign" design canvas artifact from this project's design session.
- **Palette** (v1 tokens unchanged, two additions):
  - Primary: `#9618D1` (purple — CTAs, active states, progress fill), pressed-button shade `#70129D`
  - Secondary/accent: `#5A376B`, pressed-button shade `#3F2749`
  - Surface (dark): `#332838`; nested tile surface (stat tiles, chips): `#3D3243`
  - Background (dark): `#312D33`
  - **New**: amber/gold accent `#F0A93A` (pressed/border shade `#9C6A1D`) — used only for celebration moments: streak flame, PR badges/cards. Kept to one new accent, chosen to read as "warm" against the cool purple base.
  - App defaults to a **dark theme** (palette is dark-native); light theme is out of scope for v1.
- **Typography** (new): a display/body pairing instead of the system default — Sora (600/700/800) for headlines, hero stat numbers, and card titles; Manrope (400–800) for body text, labels, and buttons. Both via Google Fonts / `@expo-google-fonts`.
- **Buttons** (new): primary/secondary buttons get a tactile "pressed" look — a solid bottom edge in the button's darker shade (not a soft drop shadow), which flattens/shifts down on actual press. Ghost/ ghost-destructive buttons stay flat (outline only), matching their lower emphasis.
- **Icons** (new): small custom icon set drawn with `react-native-svg` (stroke-based, consistent line weight), replacing both `@expo/vector-icons` glyphs and emoji everywhere except the flame (streak) and trophy/star (PR), which are the two intentional, brand-established "celebration" glyphs — kept custom-drawn (not emoji) for cross-platform consistency, since emoji render differently per OS.
- **Components**: NativeWind (Tailwind classes in RN) + a small local component set built in the shadcn philosophy (own the code, don't depend on a closed component lib): `Button`, `Card`, `Input`, `Sheet/Modal`, `Toast`, `ProgressRing`, `EmptyState`, `Badge`, plus the new icon set.
- **Feedback**: toast notifications (success/error) standardized across all create/edit/delete actions. New-PR moments get a distinct celebratory toast/inline badge, and now also the full Post-Workout Summary screen (see Information Architecture) — still no full-screen confetti/animation overload.

### 5. Guardrails & Edge Cases
- Every list/dashboard section that can be empty renders a dedicated `EmptyState` with a single actionable CTA — never a bare "no data" text.
- Validation: a workout template needs a name + ≥1 exercise; a logged set needs reps > 0 (weight may be 0 for bodyweight); custom exercises need a non-empty name.
- Deletes are destructive → confirm dialog; deleting a workout template does **not** delete past sessions that reference it (sessions keep their own snapshot of exercise/set data).
- Google Drive auth/sync failures degrade gracefully: app remains usable against the local AsyncStorage cache, with a non-blocking toast indicating sync is pending/failed, and retries on next foreground/reconnect.

### 6. Stack Decisions
- **Expo + Expo Router**, TypeScript (strict).
- **NativeWind** for styling; local shadcn-style primitives (no web-only shadcn/ui, since this is React Native).
- **State**: React Context + hooks for the in-memory `GymTrackerData` store, backed by AsyncStorage; a thin sync module talks to Drive REST API (`files.create`/`files.update`/`files.get` with `drive.file` scope).
- **Auth**: Google sign-in via `expo-auth-session` (Google provider), requesting only the `drive.file` scope.

---

## DEV — Implementation

### Project structure
```
app/
  _layout.tsx                 root layout: providers (Toast, GymData), Stack (tabs + session modal)
  (tabs)/_layout.tsx           bottom tab navigator (Dashboard, Workouts, History)
  (tabs)/index.tsx             Dashboard
  (tabs)/workouts/             Stack: index (list), create, [id]/edit
  (tabs)/history/              Stack: index (sessions/PRs segmented — Sessions drills into month/[month],
                                 a "YYYY-MM"-keyed list of that month's sessions, before session/[id]),
                                 month/[month], session/[id], pr/[exerciseId]
  session/[workoutId].tsx      full-screen modal: session logging flow (outside the tabs)
  session/summary/[sessionId].tsx  full-screen modal: Post-Workout Summary (time trained hero stat,
                                 volume/sets/exercises row, per-PR amber cards) — reached via
                                 router.replace from handleFinish, reads the just-saved session back out
                                 of GymDataContext by id, and takes the PR-hit exercise ids as a
                                 comma-joined route param rather than recomputing the diff a second time
components/
  ui/                          Button (tactile pressed-edge primary/secondary/destructive, flat ghost),
                                 Card, Input, Sheet, ConfirmDialog, Toast, ProgressRing, EmptyState, Badge
  icons/                        custom react-native-svg icon set (stroke-based line icons + two filled
                                 "celebration" glyphs, flame and trophy) replacing @expo/vector-icons and
                                 emoji everywhere; see the design system note below on Animated.View + className
  ExercisePicker.tsx            search existing exercises + add-custom, used by WorkoutForm and the session screen
  WorkoutForm.tsx                shared create/edit workout template form
lib/
  types.ts                      GymTrackerData and entity types (matches PO data model, plus denormalized
                                 workoutName/exerciseName snapshots on sessions per the "sessions keep their
                                 own snapshot" guardrail, so a session stays readable after its workout/exercise
                                 is edited or deleted)
  storage.ts                    AsyncStorage read/write of the local GymTrackerData copy
  seedExercises.ts               ~15 common exercises seeded on first launch
  pr.ts                          PR derivation (Epley 1RM), PR history, session volume — all computed, not stored
  dateUtils.ts                   week/month bucketing, streak calc, workout-rotation suggestion
  GymDataContext.tsx             React Context store: loads local data, exposes mutations
                                 (createWorkout/updateWorkout/deleteWorkout/addCustomExercise/logSession/
                                 setWeeklyGoal), persists to AsyncStorage on every mutation, and fires a
                                 background Drive push/pull (never blocks the UI on network)
  googleAuth.tsx                 Google sign-in via expo-auth-session, drive.file scope only —
                                 GoogleAuthProvider only mounts the real expo-auth-session hook when a
                                 client ID is configured (see note below); unconfigured apps get a stub
                                 "signed out" value instead of ever calling that hook
  driveSync.ts                   Drive REST calls (files.list/get/create/patch) + last-write-wins merge
  ToastContext.tsx                global toast queue used for every create/edit/delete/sync outcome
components/ErrorBoundary.tsx      class-component error boundary wrapping the whole app tree; defense-in-
                                 depth only, not a substitute for fixing the underlying bug
```

### Notable implementation details (fixes for crashes found during QA)
- **`GoogleAuthProvider` conditional mount**: `expo-auth-session`'s Google provider (`Google.useAuthRequest`) throws *synchronously* on web when `webClientId` is undefined, instead of returning a disabled request — so it can never be called unconditionally. `lib/googleAuth.tsx` splits this into a `GoogleAuthProvider` that renders a stub "signed out" context value when `isGoogleAuthConfigured()` is false, and only mounts a child component that calls the real hook when at least one client ID is set. This keeps the hook call itself unconditional within whichever component renders it (rules-of-hooks safe), while letting the zero-env-vars/local-only mode — the default most users and QA will run in — work without ever touching the auth-session hook.
- **`tailwind.config.js` `darkMode: 'class'`**: with the Tailwind default of `darkMode: 'media'`, NativeWind's own web runtime throws `Cannot manually set color scheme, as dark mode is type 'media'` on startup (its internal `MutationObserver` calls `colorScheme.set()`, which the 'media' strategy rejects). Since this app is dark-only and never toggles theme by OS preference, `'class'` avoids the crash and has no functional downside here.
- **`components/ErrorBoundary.tsx`**: wraps the whole app in `app/_layout.tsx` as a safety net so a future uncaught error surfaces a "Something went wrong" screen instead of a blank page — added alongside, not instead of, fixing the two crashes above.
- **Fonts**: Sora (600/700/800) and Manrope (400–800) via `@expo-google-fonts/sora` / `@expo-google-fonts/manrope`, loaded with `useFonts` in `app/_layout.tsx` behind the standard `expo-splash-screen` prevent/hide pattern (the app renders nothing until fonts resolve). Exposed as NativeWind `fontFamily` tokens in `tailwind.config.js` (`font-display`/`displayBold`/`displayBlack` for Sora, `font-body`/`bodyMedium`/`bodySemibold`/`bodyBold`/`bodyExtrabold` for Manrope) — screens use those classes, never a raw `fontFamily` string.
- **`Animated.View` + NativeWind `className` don't mix**: NativeWind's style interop wraps `View`/`Text`/etc. from `react-native` directly; `Animated.createAnimatedComponent(View)` is a distinct component reference that interop doesn't automatically cover, so `className` on an `Animated.View` silently no-ops (no error — the element just renders unstyled, e.g. a 0-size dot). Found live in the browser while verifying the session screen's pulsing-dot timer and the Summary screen's pop-in checkmark circle. Fix: give any `Animated.View` its full visual style (size/color/radius, not just the animated property) via the inline `style` prop instead of `className`.

### Running the app
```
npm install
npm run web       # or: npm start   (then press i/a for iOS/Android simulators, or scan the QR code)
npm run typecheck # tsc --noEmit
```
The app works fully offline on first run (AsyncStorage only, seeded with common exercises). Google Drive sync activates automatically once signed in.

### Google Drive / OAuth setup
Copy `.env.example` to `.env` and fill in OAuth client IDs from Google Cloud Console (APIs & Services → Credentials), requesting only the `drive.file` scope:
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

No sign-in UI is wired into a settings screen yet — `useGymData()` exposes `signIn`/`signOut`/`isSignedIn`/`isGoogleConfigured` for a future Settings entry point. Without any client ID configured, the app runs local-only and Drive calls are simply never attempted.

### Verification performed
- `tsc --noEmit`: clean, no errors.
- `npx expo export --platform web`: bundles all modules successfully (validates imports, NativeWind/Tailwind processing, and route resolution end to end). **Note**: this only proves the bundle builds — it does not execute the app, so it will not catch a runtime crash (this is exactly how the two bugs above slipped through an earlier pass).
- **Live browser check** (`npx expo start --web`, loaded in an actual browser, console inspected for errors): confirmed the app renders correctly with **no `.env` configured** — Dashboard empty state, tab bar, and the Create Workout form all render with zero console errors/exceptions. This is the scenario the two fixes above target.
- **Not verified**: on-device/simulator runtime behavior (navigation feel, keyboard interactions, actual Google OAuth round-trip, toast timing) — this environment has no iOS/Android simulator or a way to complete a live Google consent flow. QA should smoke-test the golden path (create workout → start → log sets → finish → verify in History → verify PR) on a real device or simulator before sign-off.

### Deviations from the PO spec
- Sessions always originate from a workout template (via "Start Workout"); the data model keeps `workoutId` optional for future freeform logging, but no screen currently creates a session without one, since the PO's only specified entry point is "Start Workout" from the Workouts screen.
- No Settings screen exists yet for weekly-goal editing or Google sign-in/out — the mutations (`setWeeklyGoal`, `signIn`, `signOut`) are implemented and exposed by the store, but the PO spec's 3 screens (Dashboard/Workouts/History) didn't include a Settings surface, so wiring the UI for these was left out of this pass rather than adding an unscoped screen.

---

## QA — Verification

QA method: live functional testing in an actual browser (`npx expo start --web`), not just `tsc`/bundle checks — driving the UI, reading the console for uncaught errors, and reproducing edge cases by hand. On-device (iOS/Android simulator) runtime was not available in this environment; the checklist below is web-verified, and a device smoke test of the golden path is recommended before treating this as fully signed off across all target platforms.

### Checklist against PO rules

| Area | Rule (from PO section) | Result |
|---|---|---|
| Screens | Dashboard/Workouts/History as 3 tabs + session-logging flow | Pass |
| Dashboard | Weekly progress ring/bar vs. goal | Pass — ring + "X / 3 sessions" verified |
| Dashboard | Streak (consecutive weeks) | Pass |
| Dashboard | Suggested workout for today | Pass |
| Dashboard | Monthly stats (sessions, volume, new PRs) | Pass |
| Dashboard | Empty state with CTA when no templates | Pass |
| Workouts | Create/edit with exercises, sets/reps/weight, custom exercise | Pass |
| Workouts | Validation: name required, ≥1 exercise required | Pass (toasts confirmed via both visual and accessibility-tree checks) |
| Workouts | Delete with confirm dialog; past sessions retain their own snapshot | Pass — dialog message and post-delete History both verified |
| Workouts | Start Workout pre-fills session from template targets | Pass |
| History | Sessions list + detail (exercises, sets×reps×weight) | Pass |
| History | PRs list + Epley 1RM + progression detail | Pass — spot-checked math (70kg×10 → Est. 1RM 93kg) |
| History | Empty states | Pass (Workouts' empty state visually verified; History's CTA target verified in code — both point at `/workouts`, not a form) |
| Guardrails | Toasts standardized on create/edit/delete, incl. celebratory PR toast | Pass |
| Guardrails | Google Drive failure degrades gracefully to local-only | Pass, after fix (see below) |

### Bugs found and resolved this round
All of the following were found via live browser testing (not caught by `tsc` or `expo export`, which only validate that code compiles/bundles) and sent back to DEV; all are now fixed and re-verified:

1. **Blocking crash**: app was a blank white screen whenever no Google OAuth client ID was configured (the default/local-only state) — `expo-auth-session`'s `useAuthRequest` throws synchronously on web without a `webClientId`. Fixed via a conditional-mount `GoogleAuthProvider`. This was the most serious finding, since it broke the app entirely in its default configuration.
2. **Blocking crash (uncovered by fix #1)**: NativeWind's default `darkMode: 'media'` throws on web startup. Fixed via `darkMode: 'class'` (safe since the app is dark-only).
3. **Navigation bug**: reaching `/workouts/create` via a cross-tab empty-state CTA (Dashboard's "Create your first workout"), submitting, then switching tabs away and back to Workouts landed back on the stale, already-submitted create form instead of the workouts list — risked an accidental duplicate creation. Fixed by using `router.replace('/workouts')` instead of `router.back()` on submit.
4. **Cosmetic**: delete-confirmation dialog briefly rendered `"undefined" will be removed...` during its close animation. Fixed by decoupling the dialog's visibility flag from the data it displays.
5. **Cosmetic, web-only**: `ProgressRing`'s SVG rotation props produced a persistent dev-mode warning banner on web. Fixed by rotating the wrapping `View` via style instead of SVG `rotation`/`origin` props.
6. **Cosmetic**: deprecated `pointerEvents` prop usage in `ToastHost` triggered a console warning. Fixed by moving it into `style`.

After all fixes: full golden path re-verified end to end (create workout → start → log sets → finish → Dashboard stats/streak/PR toast update → History sessions → History PRs) with zero console errors or exceptions.

### Known gaps / carried-forward items (not blocking, not silently dropped)
- No Settings UI for Google sign-in/out or editing the weekly goal (mutations exist in the store; no screen wires them up) — noted by DEV as an intentional scope decision since the PO spec's 3 screens didn't include Settings. Flagging here so it's a deliberate, visible product decision rather than an oversight — revisit if Drive sync needs to actually be used, since there is currently no way to trigger sign-in from the UI.
- No real Google OAuth client IDs are configured (by design — QA doesn't fabricate credentials); the Drive sync code path itself (as opposed to the "no config" fallback path) has not been exercised end-to-end against a live Google account.
- Native iOS/Android runtime (as opposed to the web target) has not been smoke-tested in this environment.
