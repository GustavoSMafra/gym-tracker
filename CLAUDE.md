# Gym Tracker

A personal-use mobile app to create workouts, log completed sessions, and track history/PRs per exercise. Built with React Native + Expo (Expo Router) + TypeScript, styled with NativeWind (Tailwind for RN) and a small shadcn-style local component library. Data is persisted to Firebase (Firestore, one document per device) via Firebase Anonymous Auth, with AsyncStorage used as a local cache/offline buffer.

This file is the living source of truth for the project. It is organized by role, per the team process defined in `project_instruction.md`: **PO → DEV → QA**.

---

## PO — Product & System Design

### 1. Vision
Single-user mobile gym tracker. Three jobs to be done:
1. Create/manage reusable **workout templates** (exercises, target sets/reps/weight).
2. **Log** a completed session against a template (or freeform).
3. **Review** history and **PRs** per exercise, plus a motivating dashboard.

No auth/roles at all — the app authenticates to Firebase anonymously and silently on first launch, with no sign-in UI, since there is only one user and one device.

### 2. Information Architecture (screens)
Bottom tab navigation (Expo Router), 3 tabs:

- **Dashboard** (`/`) — home screen
- **Workouts** (`/workouts`) — CRUD for templates, entry point to start a session
- **History** (`/history`) — sessions log + PRs report

A 4th, non-tab route handles **session logging** (`/workouts/[id]/log` or `/log/[sessionId]`), launched from Workouts via "Start Workout". It's a flow, not a tab, since it's a focused full-screen task (rest timer, set-by-set entry) rather than a browsing surface.

**Post-Workout Summary**: finishing a session doesn't drop the user straight back on Dashboard with just a toast — it goes to a celebratory full-screen summary first (time trained as the hero stat, volume/sets/exercises as secondary stats, a distinct card for any new PR hit that session), with a "Done" action to return to Dashboard. This is a 5th route in the session-logging flow, not a tab.

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
Single JSON document synced to Firestore, one document per device keyed by its (anonymous) Firebase Auth uid — Firestore security rules restrict each document to `request.auth.uid == uid`. Local AsyncStorage mirrors it for offline reads/writes; a sync pass reconciles on app foreground/reconnect using `updatedAt` timestamps (last-write-wins, since this is single-user/single-device — no conflict UI needed).

```ts
interface GymTrackerData {
  version: 1;
  settings: {
    weeklyGoal: number; // sessions/week, default 3
  };
  exercises: Exercise[];
  workouts: Workout[];       // templates
  sessions: WorkoutSession[]; // completed logs
  updatedAt: string;         // ISO, drives last-write-wins sync
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
  workoutName: string;      // snapshot, survives the workout being edited/deleted
  date: string;             // ISO date
  startedAt: string;
  completedAt?: string;
  exercises: PerformedExercise[];
  notes?: string;
}

interface PerformedExercise {
  exerciseId: string;
  exerciseName: string;     // snapshot, survives the exercise being edited/deleted
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
- **Aesthetic**: dark, gamified in small doses, dense and tactile — Strong's fast, data-dense set-logging (tap-to-complete sets); Strava's bold hero numbers and a celebratory post-workout recap; Duolingo's chunky, tactile "pressed" buttons and streak/PR celebration — on a purple base palette.
- **Palette**:
  - Primary: `#9618D1` (purple — CTAs, active states, progress fill), pressed-button shade `#70129D`
  - Secondary/accent: `#5A376B`, pressed-button shade `#3F2749`
  - Surface (dark): `#332838`; nested tile surface (stat tiles, chips): `#3D3243`
  - Background (dark): `#312D33`
  - Amber/gold accent `#F0A93A` (pressed/border shade `#9C6A1D`) — used only for celebration moments: streak flame, PR badges/cards
  - App defaults to a **dark theme** (palette is dark-native); light theme is out of scope.
- **Typography**: Sora (600/700/800) for headlines, hero stat numbers, and card titles; Manrope (400–800) for body text, labels, and buttons. Both via Google Fonts / `@expo-google-fonts`.
- **Buttons**: primary/secondary buttons get a tactile "pressed" look — a solid bottom edge in the button's darker shade (not a soft drop shadow), which flattens/shifts down on actual press. Ghost/ghost-destructive buttons stay flat (outline only), matching their lower emphasis.
- **Icons**: small custom icon set drawn with `react-native-svg` (stroke-based, consistent line weight), used everywhere except the flame (streak) and trophy/star (PR), which are the two intentional, brand-established "celebration" glyphs — kept custom-drawn (not emoji) for cross-platform consistency.
- **Components**: NativeWind (Tailwind classes in RN) + a small local component set built in the shadcn philosophy (own the code, don't depend on a closed component lib): `Button`, `Card`, `Input`, `Sheet/Modal`, `Toast`, `ProgressRing`, `EmptyState`, `Badge`, plus the custom icon set.
- **Feedback**: toast notifications (success/error) standardized across all create/edit/delete actions. New-PR moments get a distinct celebratory toast/inline badge, and the full Post-Workout Summary screen — no full-screen confetti/animation overload.

### 5. Guardrails & Edge Cases
- Every list/dashboard section that can be empty renders a dedicated `EmptyState` with a single actionable CTA — never a bare "no data" text.
- Validation: a workout template needs a name + ≥1 exercise; a logged set needs reps > 0 (weight may be 0 for bodyweight); custom exercises need a non-empty name.
- Deletes are destructive → confirm dialog; deleting a workout template does **not** delete past sessions that reference it (sessions keep their own snapshot of exercise/set data).
- Firebase auth/sync failures degrade gracefully: app remains usable against the local AsyncStorage cache, with a non-blocking toast indicating sync is pending/failed, and retries on next foreground/reconnect.

### 6. Stack Decisions
- **Expo + Expo Router**, TypeScript (strict).
- **NativeWind** for styling; local shadcn-style primitives (no web-only shadcn/ui, since this is React Native).
- **State**: React Context + hooks for the in-memory `GymTrackerData` store, backed by AsyncStorage; a thin sync module talks to Firestore (`getDoc`/`setDoc` via the Firebase JS SDK).
- **Auth**: Firebase Anonymous Auth (`signInAnonymously`) — no OAuth flow, no consent screen, no external identity provider. Silent and automatic on first launch; the resulting uid is what Firestore security rules scope each device's document to.

---

## DEV — Implementation

### Project structure
```
app/
  _layout.tsx                 root layout: providers (Toast, FirebaseAuth, GymData), Stack (tabs + session modal)
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
                                 "celebration" glyphs, flame and trophy); see the design system note below
                                 on Animated.View + className
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
                                 background Firestore push/pull (never blocks the UI on network)
  firebase.ts                    Firebase SDK init (App/Auth/Firestore) from env-derived config;
                                 isFirebaseConfigured() gates all of the below — unconfigured apps never
                                 touch the SDK and stay local-only. Firestore is initialized with
                                 `ignoreUndefinedProperties: true` (see note below)
  firebaseAuth.tsx                Firebase Anonymous Auth (signInAnonymously) — no OAuth, no consent
                                 screen, silent on first launch; FirebaseAuthProvider exposes the
                                 resulting uid, staying a stub "signed out" value when Firebase isn't
                                 configured so unconfigured apps never touch the SDK
  firestoreSync.ts                 Firestore getDoc/setDoc against one document per uid + last-write-wins merge
  ToastContext.tsx                global toast queue used for every create/edit/delete/sync outcome
components/ErrorBoundary.tsx      class-component error boundary wrapping the whole app tree; defense-in-
                                 depth only, not a substitute for fixing the underlying bug
```

### Notable implementation details
- **Firestore rejects `undefined` field values**: `GymTrackerData` has several optional fields (`Workout.description`, `WorkoutExercise.targetWeight`/`restSeconds`, etc.) that are set to `undefined` rather than omitted (e.g. `description?.trim() || undefined`). Firestore's `setDoc` throws `Unsupported field value: undefined` on any such field. `lib/firebase.ts` initializes Firestore with `initializeFirestore(app, { ignoreUndefinedProperties: true })` instead of `getFirestore(app)`, so writes silently drop undefined fields the way `JSON.stringify` does, instead of sanitizing every call site.
- **Seed data must never out-rank real synced data**: `GymDataContext`'s first-load effect seeds default exercises whenever local storage is empty — true on first-ever launch, but also after a reinstall, a new device, or cleared local storage for an existing Firestore user. The seeded document's `updatedAt` is deliberately left at `emptyData()`'s epoch value (not "now"): since `reconcile()`'s merge is last-write-wins by `updatedAt`, a "now"-stamped empty seed would always out-rank genuine older remote data and get uploaded over it, silently wiping the user's cloud data. Keeping it at epoch guarantees any real save — local or remote — always wins the merge instead.
- **`getReactNativePersistence` type resolution**: `@firebase/auth`'s package.json `exports` map lists a platform-agnostic top-level `"types"` entry *before* its `"react-native"`-conditioned one, so `tsc` always resolves the cross-platform `auth-public.d.ts` and never sees this RN-only helper — even with `customConditions: ["react-native"]` set (`expo/tsconfig.base`, needed for Metro's own bundler resolution). `lib/firebase.ts` works around it with an untyped namespace import (`import * as FirebaseAuthCore from '@firebase/auth'`) cast to the helper's real signature, while the `Persistence` type itself still comes from the typed `firebase/auth` import. Metro resolves the actual React Native build correctly at bundle/runtime regardless of what `tsc` sees.
- **`tailwind.config.js` `darkMode: 'class'`**: with the Tailwind default of `darkMode: 'media'`, NativeWind's own web runtime throws `Cannot manually set color scheme, as dark mode is type 'media'` on startup (its internal `MutationObserver` calls `colorScheme.set()`, which the 'media' strategy rejects). Since this app is dark-only and never toggles theme by OS preference, `'class'` avoids the crash and has no functional downside here.
- **`components/ErrorBoundary.tsx`**: wraps the whole app in `app/_layout.tsx` as a safety net so an uncaught error surfaces a "Something went wrong" screen instead of a blank page — a safety net alongside, not instead of, fixing underlying bugs.
- **Fonts**: Sora (600/700/800) and Manrope (400–800) via `@expo-google-fonts/sora` / `@expo-google-fonts/manrope`, loaded with `useFonts` in `app/_layout.tsx` behind the standard `expo-splash-screen` prevent/hide pattern (the app renders nothing until fonts resolve). Exposed as NativeWind `fontFamily` tokens in `tailwind.config.js` (`font-display`/`displayBold`/`displayBlack` for Sora, `font-body`/`bodyMedium`/`bodySemibold`/`bodyBold`/`bodyExtrabold` for Manrope) — screens use those classes, never a raw `fontFamily` string.
- **`Animated.View` + NativeWind `className` don't mix**: NativeWind's style interop wraps `View`/`Text`/etc. from `react-native` directly; `Animated.createAnimatedComponent(View)` is a distinct component reference that interop doesn't automatically cover, so `className` on an `Animated.View` silently no-ops (no error — the element just renders unstyled, e.g. a 0-size dot). Used on the session screen's pulsing-dot timer and the Summary screen's pop-in checkmark circle. Fix: give any `Animated.View` its full visual style (size/color/radius, not just the animated property) via the inline `style` prop instead of `className`.

### Running the app
```
npm install
npm run web       # or: npm start   (then press i/a for iOS/Android simulators, or scan the QR code)
npm run typecheck # tsc --noEmit
```
The app works fully offline on first run (AsyncStorage only, seeded with common exercises). Firebase sync activates automatically and silently (anonymous auth, no user action) once configured.

### Firebase setup
1. Create a Firebase project (console.firebase.google.com), add a Web app to it (the JS SDK config is the same across platforms).
2. Enable **Firestore Database** and enable the **Anonymous** sign-in provider under **Authentication → Sign-in method**. No OAuth client IDs, consent screen, or redirect URIs are needed — this is the only console step auth requires.
3. In Firestore rules, restrict the `gymTrackerData/{uid}` collection to its owner: `allow read, write: if request.auth != null && request.auth.uid == uid;`.
4. Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` (from the Firebase project settings).

`useGymData()` exposes `isSignedIn`/`isFirebaseConfigured` (read-only status, e.g. for a future Settings screen). There's no `signIn`/`signOut` to wire up, since auth is automatic. Without Firebase configured, the app runs local-only and Firestore calls are simply never attempted.

### Verification performed
- `tsc --noEmit`: clean, no errors.
- `npx expo export --platform web`: bundles all modules successfully (validates imports, NativeWind/Tailwind processing, and route resolution end to end).
- **Live browser check** (`npx expo start --web`): confirmed the app renders correctly with zero console errors both with **no `.env` configured** (local-only mode) and **against a real Firebase project** (Firestore + Anonymous Auth enabled).
- **Real end-to-end Firebase verification**: with a real project configured, confirmed via network inspection and direct testing — anonymous sign-in succeeds and persists across reloads, Firestore Listen/Write channels establish, and a workout created in the UI survives a `localStorage.clear()` + reload (i.e. genuinely round-trips through Firestore, not just AsyncStorage).
- **Not verified**: on-device/simulator runtime behavior (navigation feel, keyboard interactions, toast timing, the `getReactNativePersistence` RN build Metro resolves at bundle time) — this environment has no iOS/Android simulator. QA should smoke-test the golden path on a real device or simulator before sign-off, though the equivalent Auth/Firestore code paths have been verified end to end from the web target.

### Deviations from the original brief
- `project_instruction.md` (the original brief) called for Google Drive/Sheets as the data store with Google sign-in. The final implementation uses **Firebase (Firestore + Anonymous Auth)** instead: Firestore gives proper per-document security rules and a real database instead of a single opaque Drive file, and — since this is strictly single-user/single-device with no one else to ever authenticate as — Anonymous Auth avoids all Google OAuth ceremony (consent screen, per-platform client IDs) for zero product benefit. Sync remains the same shape either way: one JSON document, local-first, last-write-wins by `updatedAt`.
- Sessions always originate from a workout template (via "Start Workout"); the data model keeps `workoutId` optional for future freeform logging, but no screen currently creates a session without one, since the only specified entry point is "Start Workout" from the Workouts screen.
- No Settings screen exists for weekly-goal editing — the `setWeeklyGoal` mutation is implemented and exposed by the store, but the 3 screens in scope (Dashboard/Workouts/History) didn't include a Settings surface, so wiring up a UI for it was left out rather than adding an unscoped screen.

---

## QA — Verification

QA method: live functional testing in an actual browser (`npx expo start --web`), not just `tsc`/bundle checks — driving the UI, reading the console for uncaught errors, reproducing edge cases by hand, and (for sync) inspecting network traffic against a real Firebase project rather than only the local-only fallback path.

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
| Workouts | Validation: name required, ≥1 exercise required | Pass |
| Workouts | Delete with confirm dialog; past sessions retain their own snapshot | Pass |
| Workouts | Start Workout pre-fills session from template targets | Pass |
| History | Sessions list + detail (exercises, sets×reps×weight) | Pass |
| History | PRs list + Epley 1RM + progression detail | Pass — spot-checked math (70kg×10 → Est. 1RM 93kg) |
| History | Empty states | Pass |
| Guardrails | Toasts standardized on create/edit/delete, incl. celebratory PR toast | Pass |
| Guardrails | Firebase failure degrades gracefully to local-only | Pass |
| Guardrails | Data actually round-trips through Firestore against a real project | Pass — verified by network inspection and a create → clear-storage → reload cycle |

### Known invariants (do not regress)
These fixes are load-bearing — reverting them reintroduces a real, previously-observed bug rather than a style regression:
- **`ignoreUndefinedProperties: true`** in `lib/firebase.ts`'s Firestore init. Without it, any workout/exercise with an unset optional field (`description`, `targetWeight`, `restSeconds`, ...) fails to sync with `Unsupported field value: undefined`, silently, since the failure is only caught by a generic toast.
- **Seeded default data's `updatedAt` must stay at the epoch value**, never "now". Stamping it "now" makes a freshly-reseeded empty document (which happens on any local-storage loss, not just true first launch) always win the last-write-wins merge over real remote data — silently deleting a user's cloud data on reinstall/new device/cleared storage.
- **`FirebaseAuthProvider`/`lib/firebase.ts` must never touch the Firebase SDK when unconfigured** — `isFirebaseConfigured()` gates every SDK call so the zero-`.env` local-only mode (the default most users run in) stays crash-free.

### Known gaps / carried-forward items (not blocking, not silently dropped)
- No Settings UI for editing the weekly goal — the mutation exists in the store; no screen wires it up (see "Deviations from the original brief").
- Native iOS/Android runtime (as opposed to the web target) has not been smoke-tested in this environment — this also means the `getReactNativePersistence`/`initializeAuth` code path in `lib/firebase.ts` (only reachable on native, not web) has never actually executed anywhere, though the equivalent web Auth/Firestore code paths have been verified end to end against a live Firebase project.
