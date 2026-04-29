---

name: review-dirty
description: Deep architectural review of current uncommitted changes against project rules and requested scope.
----------------------------------------------------------------------------------------------------------------

Analyze all current uncommitted changes against:

* `ARCHITECTURE.md`
* `AGENTS.md`

Evaluate both:

1. architectural compliance
2. scope compliance

## Check Categories

### Scope Discipline

* Unrelated file changes
* Overengineering
* Feature creep
* Broad refactors without explicit need

### Security & Logic

* Missing `prisma.$transaction`
* TOCTOU risks
* Weak auth enforcement
* Missing `requireAuth` / `requireAdmin`
* Weak input validation
* Missing rate-limit protections
* CSP regressions or nonce misuse

### Code Quality

* Console usage instead of Pino
* Poor error handling
* Broken component boundary separation
* Incorrect server/client usage
* Invalid naming or schema drift

### Data Safety

* PII leakage
* Unsafe logs
* Overexposed data in actions or UI
* Missing sanitization or schema coverage

## Output Format

For each finding return:

* File
* Issue
* Severity: low / medium / high / critical
* Category
* Why it matters

Then return:

## Summary

* Scope status: clean / violated
* Architecture status: clean / violated
* Recommended next step

DO NOT apply fixes.
