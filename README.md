# Gym Tracker

A personal, single-user mobile app for creating workouts, logging completed training sessions (with a live timer), and reviewing history and personal records. Built with React Native + Expo, styled with NativeWind, and inspired by Strong, Strava, and Duolingo.

## Features

- **Dashboard** — weekly progress ring, training streak, a suggested workout for the day, and monthly stats (sessions, volume, new PRs, time trained).
- **Workouts** — create and edit reusable workout templates (exercises, target sets/reps/weight); start one to log a real session.
- **Session logging** — sets pre-filled from the template, tap-to-complete each set, a live running timer.
- **Post-workout summary** — a celebratory recap after finishing: time trained, volume, sets, exercises, and any new PR.
- **History** — sessions grouped by month, drilling into individual session detail; personal records per exercise with estimated 1RM (Epley formula) and progression over time.
- **Google Drive sync** (optional) — signs in with Google (`drive.file` scope only) and syncs your data as a single JSON file on your own Drive; the app works fully offline against local storage when this isn't configured.

## Tech stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation), TypeScript
- [NativeWind](https://www.nativewind.dev) (Tailwind CSS for React Native) with a small local, shadcn-style component set
- `react-native-svg` for a custom icon set, `@expo-google-fonts` (Sora + Manrope) for typography
- `@react-native-async-storage/async-storage` for local persistence; `expo-auth-session` + the Drive REST API for optional cloud sync

## Getting started

```bash
npm install
npm start          # then press i/a for a simulator, or scan the QR code with Expo Go
```

Other scripts:

```bash
npm run web         # run in a browser
npm run android      # run on an Android emulator/device
npm run ios          # run on an iOS simulator/device
npm run typecheck   # tsc --noEmit
```

The app works fully offline on first run — no setup required. It seeds a small library of common exercises and stores everything locally until you optionally connect Google Drive.

### Testing on your phone

Install [Expo Go](https://expo.dev/go) from the App Store or Play Store, run `npm start`, and scan the printed QR code. Phone and computer need to be on the same Wi-Fi network — if they aren't (e.g. developing on a remote machine), use `npm start -- --tunnel` instead.

### Google Drive sync (optional)

Copy `.env.example` to `.env` and fill in OAuth client IDs from the [Google Cloud Console](https://console.cloud.google.com) (APIs & Services → Credentials), requesting only the `drive.file` scope:

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
```

Leave these unset to keep the app fully local-only.

## Project structure

```
app/                    Expo Router screens (file-based routing)
  (tabs)/                Dashboard, Workouts, History — bottom tab navigator
  session/               Session logging + post-workout summary (modal flow)
components/
  ui/                     Local UI primitives (Button, Card, Input, Sheet, Toast, ...)
  icons/                  Custom react-native-svg icon set
lib/                    Data model, local storage, PR math, date/streak helpers, Google Drive sync
```

## Documentation

[`CLAUDE.md`](./CLAUDE.md) is the living source of truth for this project — product/design decisions and rationale, implementation notes (including a couple of React Native Web gotchas worth knowing before touching styling), and QA verification notes. [`project_instruction.md`](./project_instruction.md) is the original project brief.
