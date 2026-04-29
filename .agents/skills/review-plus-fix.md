---

name: review-plus-fix
description: Iteratively review and fix code until the diff is minimal, correct, and architecturally compliant.
---------------------------------------------------------------------------------------------------------------

Execution loop:

1. Run `review-dirty`
2. Fix ONLY the identified violations
3. Run `diff-aware-review`
4. Re-check the code

---

## Loop Rules

* Do NOT introduce new changes beyond fixes
* Do NOT expand scope during fixes
* Do NOT refactor unrelated code

---

Repeat until:

* no meaningful violations remain
  OR
* 5 iterations have been completed

---

## Stop Condition

If 5 iterations are reached:

* stop automatically
* report remaining issues clearly
* do NOT claim full compliance

---

## Success Condition

* requested task is solved
* scope remains tight
* architecture remains intact
* no major side effects remain
