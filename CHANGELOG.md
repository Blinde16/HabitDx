# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) as described in [CONTRIBUTING.md](CONTRIBUTING.md).

## [Unreleased]

### Fixed

- **Web — React maximum update depth (error #185):** Resolved production and dev crashes where React Navigation hit nested update limits during auth redirects. Root cause was `router.replace` + `useSegments` / unstable dependencies in the root `ProtectedRoute` wrapper, which re-ran whenever navigation or child screens (e.g. home check-in) updated. Mitigations included stable `navReady` handling, deferred replaces, and OAuth/notification hooks that do not re-subscribe on every root navigation key change ([`95aae9f`](https://github.com/Blinde16/HabitDx/commit/95aae9f)).
- **Web — Auth redirect loops:** Removed imperative navigation from root `ProtectedRoute`; auth gating now uses Expo Router `<Redirect href="…" />` in group layouts — `(auth)`, `(tabs)`, `(onboarding)` — plus `index` and `profile` for unauthenticated access. `ProtectedRoute` only initializes Supabase session and shows the global loading overlay ([`3234552`](https://github.com/Blinde16/HabitDx/commit/3234552)).

### Changed

- **Auth routing:** Signed-out users are sent to `/(auth)/login` via layout/index/profile redirects; signed-in users on auth form screens are redirected to `/` from `(auth)/_layout`. No competing `router.replace` to login from `index` for the same session.

### Chore

- **Git:** Ignore local Vercel link metadata (`.vercel` in `.gitignore`) ([`95aae9f`](https://github.com/Blinde16/HabitDx/commit/95aae9f)).

---

When you cut a **versioned release** (e.g. `v1.1.0`), add a dated section above `[Unreleased]` and move completed bullets out of Unreleased.
