# CLAUDE.md

## Project Overview
* **Project name:** [Your project name]
* **What it does:** [One sentence describing what this app/tool does]
* **Tech stack:** [e.g. Next.js, React, Tailwind, Supabase, Python, etc.]
* **Main language:** [e.g. TypeScript, Python, etc.]

## Project Structure
* `src/` — main application code
* `components/` — reusable UI components
* `pages/` or `app/` — routes and pages
* `lib/` or `utils/` — helper functions and utilities
* `public/` — static assets (images, fonts)
* `tests/` — test files

## Key Commands
* **Install dependencies:** `npm install`
* **Run dev server:** `npm run dev`
* **Build for production:** `npm run build`
* **Run tests:** `npm test`
* **Lint/format:** `npm run lint`

## Code Style
* Use clear, descriptive variable and function names
* Keep files small and focused — one component per file
* Use existing patterns found in the codebase before inventing new ones
* Add brief comments only where logic is non-obvious
* Use imports/exports consistently with what already exists in the project

## Rules — Always Do
1. Always read existing code before modifying it
2. Always run the dev server after changes to verify nothing is broken
3. Always match the style and patterns already used in the codebase
4. Always handle errors gracefully — never let the app crash silently
5. Always keep the UI responsive and mobile-friendly

## Rules — Never Do
1. Never delete or overwrite files without confirming first
2. Never install new packages without asking — use what's already installed
3. Never hardcode sensitive info (API keys, passwords, secrets)
4. Never make changes outside the scope of what was asked
5. Never push to git or deploy without explicit permission
6. Never rewrite working code just to "clean it up" unless asked

## Common Gotchas
* Check `.env` or `.env.local` for environment variables before assuming they don't exist
* If something looks broken, check the terminal and browser console for errors before changing code
* Don't assume the database schema — read it first

## When You're Stuck
* Ask me clarifying questions before guessing
* If a task is large, break it into steps and confirm the plan before coding
* If you hit an error you can't fix in 2 attempts, stop and explain the issue

## Testing
* Run existing tests after making changes
* If adding a new feature, write at least one basic test for it
* Don't skip tests to save time

## Git Workflow
* Use clear, descriptive commit messages (e.g. "add user login page" not "update")
* Commit small, focused changes — not everything at once
* Never force push

# SQL and Supabase
- always create .sql files for any SQL queries you want the user to run
- put all of the .sql files into /docs folder in that given project
- each file should start with a number to document the order of the operation
- we must have the entire DB schema documented in the /docs folder, in different .sql files
- name the files like "001_create_x_table.sql" or "002_change_rls_policy.sql" or "003_add_foreign_key.sql" etc.