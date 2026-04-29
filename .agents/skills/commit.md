---

name: commit
description: Stages and commits only the validated logical unit of work.
------------------------------------------------------------------------

1. Review current modified files
2. Stage only files relevant to the completed task
3. Exclude unrelated changes
4. Write a concise commit message in English

## Commit Message Rules

* imperative
* specific
* one logical unit only

Examples:

* fix: harden login lockout transaction flow
* refactor: isolate rate limit cleanup logic
* feat: add stricter contact form validation

## Final Rule

Do NOT commit:

* unrelated edits
* partial work
* uncertain fixes
