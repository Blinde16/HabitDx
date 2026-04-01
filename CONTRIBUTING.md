# Contributing to HabitDx

Thank you for contributing to HabitDx! This document outlines our development workflow, coding standards, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)
- [Commit Message Format](#commit-message-format)
- [Changelog](#changelog)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `.env.example` to `.env` and configure
4. **Start Supabase**: `supabase start`
5. **Run the app**: `npm start`

Ensure all tests and linters pass before submitting changes.

## Git Workflow

We follow a **fast micro-branch workflow** with quick merges to `main`.

### Branch Naming Convention

Format: `<type>/<description>-<your-name>`

**Types:**

- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring (no functional changes)
- `chore/` - Maintenance tasks, tooling, dependencies
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

**Examples:**

\`\`\`
feat/habit-tracking-ui-blake
fix/streak-calculation-bug-sarah
refactor/database-queries-mike
chore/update-dependencies-blake
docs/api-documentation-sarah
\`\`\`

### Workflow Steps

1. **Create a branch** from `main`:

   \`\`\`bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   \`\`\`

2. **Make changes** and commit frequently with logical units:

   \`\`\`bash
   git add <files>
   git commit -m "feat(scope): description"
   \`\`\`

3. **Push your branch**:

   \`\`\`bash
   git push -u origin feat/your-feature-name
   \`\`\`

4. **Create a Pull Request** to `main`

5. **Address review feedback** if needed

6. **Merge after approval** (requires 1 approval)

### Important Rules

- ✅ **Always branch from `main`**
- ✅ **Keep branches short-lived** (1-3 days max)
- ✅ **Make logical, atomic commits**
- ✅ **Write descriptive commit messages**
- ✅ **Run linters before committing** (pre-commit hooks do this automatically)
- ❌ **Never commit directly to `main`**
- ❌ **Never commit secrets or API keys**
- ❌ **Never leave TODO comments** without creating an issue

### Team Collaboration & Preventing Conflicts

When multiple team members are coding simultaneously, follow these practices to avoid merge conflicts:

1. **Communicate Before Starting:** Announce your task in the team chat so two people don't edit the same component or store simultaneously.
2. **Use Strictly Isolated Branches:** Always branch off `main` and use your uniquely named branch (`<type>/<description>-<your-name>`). Do not push to another team member's branch.
3. **Sync with `main` Frequently:** Merge or rebase `main` into your feature branch daily (`git pull origin main`). This helps you catch and resolve small conflicts early before opening a PR.
4. **Scope Your Changes:** Only modify files strictly relevant to your feature. Avoid generic or "drive-by" refactoring in unrelated files, as it frequently causes conflicts for others working on those files.
5. **Coordinate Complex Files:** If two features must touch the same central file (like `app.json` or `authStore.ts`), coordinate your PR merges. Once the first PR merges, the second person should immediately pull `main` to resolve conflicts locally.

## Coding Standards

### TypeScript

- **Strict mode enabled** - all code must pass TypeScript strict checks
- **Explicit types** for function parameters and return values
- **Avoid `any`** - use proper types or `unknown` if truly dynamic
- **Use interfaces** for object shapes, `type` for unions/intersections

**Example:**

\`\`\`typescript
// Good
interface User {
id: string;
name: string;
email: string;
}

function getUser(id: string): Promise<User | null> {
// ...
}

// Bad
function getUser(id: any): any {
// ...
}
\`\`\`

### React / React Native

- **Functional components** with hooks (no class components)
- **Named exports** for components (easier to search/refactor)
- **Props interfaces** defined above component

**Example:**

\`\`\`typescript
interface ButtonProps {
onPress: () => void;
title: string;
disabled?: boolean;
}

export function Button({ onPress, title, disabled = false }: ButtonProps) {
return (
<Pressable onPress={onPress} disabled={disabled}>
<Text>{title}</Text>
</Pressable>
);
}
\`\`\`

### File Organization

- **One component per file**
- **Co-locate related files** (component + styles + tests)
- **Use index files** sparingly (only for clean exports)

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

### Code Style

We use **Prettier** for formatting and **ESLint** for linting. Configuration is already set up.

**Key rules:**

- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in ES5 (objects, arrays)
- **100 character** line length

Pre-commit hooks automatically format and lint your code.

### State Management

- **Local state**: `useState` for component-specific state
- **Global state**: Zustand stores in `src/stores/`
- **Server state**: React Query or Supabase realtime (Phase 2+)

### Error Handling

- **Always handle errors** in async functions
- **User-facing errors**: Show friendly messages
- **Log errors** for debugging (use `console.error`, not `console.log`)

**Example:**

\`\`\`typescript
try {
const data = await fetchData();
return data;
} catch (error) {
console.error('Failed to fetch data:', error);
throw new Error('Unable to load data. Please try again.');
}
\`\`\`

## Project Structure

\`\`\`
src/
├── app/ # Expo Router screens (file-based routing)
│ ├── \_layout.tsx # Root layout with navigation setup
│ ├── index.tsx # Home screen (/)
│ └── (tabs)/ # Tab-based navigation (future)
├── components/ # Reusable UI components
│ ├── Button.tsx
│ ├── Card.tsx
│ └── ...
├── hooks/ # Custom React hooks
│ ├── useAuth.ts
│ └── ...
├── lib/ # Core utilities and clients
│ ├── supabase.ts # Supabase client
│ └── constants.ts # App constants
├── stores/ # Zustand state stores
│ ├── authStore.ts
│ └── ...
├── types/ # TypeScript type definitions
│ ├── database.ts # Supabase types
│ └── ...
└── utils/ # Helper functions
├── date.ts
└── ...
\`\`\`

### When to Create New Folders

- **`components/`**: Reusable UI elements used in multiple screens
- **`hooks/`**: Reusable stateful logic
- **`stores/`**: Global state that needs to be shared across screens
- **`utils/`**: Pure functions with no side effects
- **`types/`**: Shared TypeScript types/interfaces

## Commit Message Format

We follow the **Conventional Commits** specification.

### Format

\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, tooling)

### Scope

The scope indicates what part of the codebase is affected:

- `app`: App screens/routing
- `auth`: Authentication
- `db`: Database/Supabase
- `ui`: UI components
- `api`: API integration
- `mastra`: Mastra AI integration

### Examples

**Good commit messages:**

\`\`\`
feat(auth): add google oauth login

- Integrated Google OAuth with Supabase Auth
- Added sign-in button to login screen
- Configured OAuth redirect URLs

This enables users to sign in with their Google account.
\`\`\`

\`\`\`
fix(ui): resolve button press on android

- Fixed Pressable not responding on Android devices
- Added proper hitSlop and pressRetentionOffset
- Tested on Android 12 and 13

Fixes #42
\`\`\`

\`\`\`
refactor(db): optimize habit query performance

- Added index on user_id and created_at columns
- Implemented query result caching
- Reduced query time from 450ms to 80ms

Performance was degrading as user data grew.
\`\`\`

**Bad commit messages:**

\`\`\`
fix stuff
updated code
WIP
asdf
\`\`\`

### Commit Body Guidelines

- **Explain WHY**, not what (the diff shows what changed)
- **Use bullet points** for multiple changes
- **Reference issues** if applicable (`Fixes #123`, `Closes #456`)
- **Mention breaking changes** with `BREAKING CHANGE:` in footer

## Changelog

For **user-visible fixes and features** (especially web beta, auth, and deployment), add a short entry under **`[Unreleased]`** in [`CHANGELOG.md`](CHANGELOG.md) in the same PR or immediately after merge to `main`. That keeps release notes aligned with [`NEXT_STEPS.md`](NEXT_STEPS.md) and [`aiDocs/web_beta_launch_plan.md`](aiDocs/web_beta_launch_plan.md) when the change affects launch or hosting.

## Pull Request Process

### Before Creating a PR

Run the **self-review checklist**:

- [ ] Code runs without errors
- [ ] TypeScript types are correct (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] No `console.log` or debug code left
- [ ] Follows existing code patterns
- [ ] No hardcoded values that should be env vars
- [ ] Error handling is present

### PR Title Format

Use the same format as commit messages:

\`\`\`
<type>(<scope>): <description>
\`\`\`

**Examples:**

- `feat(auth): add password reset flow`
- `fix(ui): resolve layout issue on small screens`
- `refactor(db): simplify user query logic`

### PR Description Template

\`\`\`markdown

## 🎯 What This PR Does

[2-3 sentence summary of what was built]

## 🤖 AI Development Notes

**AI Tool Used:** Cursor/Windsurf/etc
**Development Time:** X minutes/hours
**AI vs Manual Split:**

- AI generated: X% of code
- Manual adjustments: [What you fixed/changed]

## 📝 Changes Made

### Files Added

- \`path/to/file.ts\` - [What this file does]

### Files Modified

- \`path/to/existing.ts\` - [What changed and why]

### Key Implementation Details

- [Detail 1]
- [Detail 2]

## 🧪 Testing

**How to test:**

1. [Step 1]
2. [Step 2]
3. [Expected result]

**Test cases covered:**

- [ ] Happy path works
- [ ] Edge cases handled
- [ ] Error states return proper messages

## ⚠️ Breaking Changes

[If any breaking changes, describe them. Otherwise write "None"]

## 📋 Reviewer Checklist

Please verify:

- [ ] Code follows project patterns
- [ ] No obvious bugs or security issues
- [ ] TypeScript types are sound
- [ ] Changes make architectural sense
- [ ] Performance implications considered

## 🔗 Related Issues

Closes #[issue-number] (if applicable)
\`\`\`

### Creating the PR

\`\`\`bash

# Push your branch

git push -u origin feat/your-feature-name

# Create PR using GitHub CLI (if installed)

gh pr create --title "feat(scope): description" --body "[paste template above]"

# Or create PR manually on GitHub

\`\`\`

## Code Review Guidelines

### As a Reviewer

- **Be constructive** - suggest improvements, don't just criticize
- **Ask questions** - "Why did you choose this approach?"
- **Praise good work** - recognize clever solutions
- **Focus on important issues** - don't nitpick minor style issues (linters handle that)
- **Test the changes** - pull the branch and verify it works

### Review Checklist

- [ ] Code is readable and maintainable
- [ ] Logic is sound and handles edge cases
- [ ] No security vulnerabilities (exposed secrets, SQL injection, etc.)
- [ ] Performance implications considered
- [ ] TypeScript types are appropriate
- [ ] Error handling is present
- [ ] Follows project conventions

### As a PR Author

- **Respond to all comments** - even if just "Done" or "Fixed"
- **Don't take feedback personally** - we're all learning
- **Ask for clarification** if you don't understand a comment
- **Update the PR** based on feedback
- **Re-request review** after making changes

## Questions?

If you have questions about contributing:

1. Check this document first
2. Look at recent PRs for examples
3. Ask in the team chat
4. Tag a team member for help

Happy coding! 🚀
