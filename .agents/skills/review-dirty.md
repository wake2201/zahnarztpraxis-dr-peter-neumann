---
name: review-dirty
description: Deep architectural review of uncommitted changes against project documentation.
---
Analyze all current uncommitted changes against the rules defined in `ARCHITECTURE.md` and `AGENTS.md`.
Specifically identify violations regarding:
- Database transaction handling and missing migrations
- Logging rule enforcement (Pino vs. console)
- Nonce-based CSP bypasses
- Missing or weak Zod validation schemas

Output a structured list of findings. Do not implement fixes at this stage.