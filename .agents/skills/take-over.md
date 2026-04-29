---

name: take-over
description: Final execution loop for Codex CLI: review, validate, test, commit, report.
----------------------------------------------------------------------------------------

Execute the finalization sequence autonomously.

---

## Step 1 — Review

Run:

* `review-plus-fix`

---

## Step 2 — Validate Critical Paths

Verify:

* Auth flow
* Server Actions
* Transactions
* Validation
* Role enforcement

If uncertainty remains:

* STOP
* report uncertainty
* do NOT continue

---

## Step 3 — Test

Run E2E tests.

If tests fail:

* identify root cause
* fix ONLY issues related to the requested task
* do NOT introduce unrelated fixes
* re-run tests

Repeat until:

* all tests pass
  OR
* a blocking issue remains

---

## Step 4 — Commit Readiness Check

Ensure:

* changes are within scope
* no unrelated modifications exist
* changes represent ONE logical unit

---

## Step 5 — Commit

Run:

* `commit`

---

## Step 6 — Final Report

Return:

* what changed
* what was validated
* what was tested
* remaining risks (if any)

---

## Final Rule

Never commit partially validated or unrelated changes.
