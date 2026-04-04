# Agent instructions (Cursor, Codex, and other AI assistants)

This repo expects **pull requests** for code changes, not direct pushes to `main`. Details: [CONTRIBUTING.md](CONTRIBUTING.md).

## Workflow (required unless the user says otherwise)

1. Create a branch from `main`: `<type>/<short-description>-<your-name>` (e.g. `feat/settings-copy-blake`).
2. Make commits with **Conventional Commits**: `feat(scope):`, `fix(scope):`, etc.
3. Update **`CHANGELOG.md`** under `[Unreleased]` when the change is user-visible (same PR).
4. Push the **branch** and open a **Pull Request** to `main`. Do not `git push origin main` for normal feature work.
5. Let the user (or CI) merge after review.

## Also follow

- CONTRIBUTING: TypeScript, formatting, commit format, PR description expectations.
- Project rules in **`.cursor/rules/`** when present.

## Direct push to `main`

Only when the user **explicitly** requests it (e.g. emergency hotfix or one-off docs). Default is always **PR path**.
