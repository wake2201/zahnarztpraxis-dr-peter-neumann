---

name: diff-aware-review
description: Reviews only the requested or modified scope first, then checks for architectural side effects.
------------------------------------------------------------------------------------------------------------

Review the task in two stages.

## Stage 1 — Requested Scope Only

Focus strictly on:

* the user's requested change
* the files directly modified
* the exact diff or implementation scope

Questions:

* Does the change solve the requested problem?
* Is the scope respected?
* Are unrelated files being changed?
* Is the implementation minimal?

## Stage 2 — Architectural Side Effects

Then evaluate whether the diff introduces side effects in:

* Auth
* Server Actions
* Validation
* Transactions
* CSP
* Logging
* Role checks
* Tests

## Output Format

Return:

### Scope Review

* Requested change fulfilled: yes/no
* Scope respected: yes/no
* Unrelated changes detected: yes/no
* Minimal diff: yes/no

### Side-Effect Review

List any architectural risks introduced by the diff.

### Final Verdict

One of:

* ACCEPTABLE
* ACCEPTABLE WITH FIXES
* REJECT

## Rules

* Prefer minimal diff over broad rewrites
* Reject changes that solve the task but violate architecture
* Do NOT implement fixes in this skill
