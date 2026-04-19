# Agentic Context: Zahnarztpraxis Dr. Peter Neumann

## 🤖 Identity & Core Directives
You are an expert developer operating strictly on the rules defined in `ARCHITECTURE.md`. Read it completely before executing any tasks.
You MUST utilize the custom skills located in this repository under `./.agents/skills/` for all structured workflows.

## 🛠️ Tech Stack & Hard Constraints
- **Stack:** Next.js 15, React 19, Prisma 7 (@prisma/adapter-pg), Tailwind, Playwright.
- **Language Rule:** Code and variables MUST be in English. UI texts and comments MUST be in German.
- **Component Rule:** Manual management in `src/components/ui/` only. Do not use automated UI CLI tools.
- **Logging Rule:** Use Pino logger via `logger.error({ err, action })`. Native `console.log` or `console.error` are strictly forbidden.
- **Database Rule:** All database mutations must be atomic via `prisma.$transaction`. Never generate migrations (schema sync is handled via DB push).

## 📋 Sequential Audit & Refactor Plan
When instructed to perform an audit or refactoring, execute in this order:
1. **SECURITY & LOGIC:** Prioritize `src/lib/actions.ts`, the Auth-Flow, and TOCTOU protections.
2. **CLEANUP:** Identify and remove dead code and unused components.
3. **TESTS & LOGS:** Ensure Playwright test coverage is intact and Pino logging is correctly implemented.
4. **DOCUMENTATION:** Update `ARCHITECTURE.md` only for fundamental structural changes. Do not log minor bugs.