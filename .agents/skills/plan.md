---

name: plan
description: Creates a precise implementation plan before any code is changed.
------------------------------------------------------------------------------

Before implementation:

1. analyze the requested task
2. identify affected files
3. identify constraints from `ARCHITECTURE.md`
4. classify risk by running `risk-level`
5. define strict scope boundaries
6. produce a minimal implementation plan

---

## Output Format

### Task Understanding

* what needs to change
* what must NOT change

### Scope Boundaries

* what is explicitly IN scope
* what is explicitly OUT of scope

### Affected Files

* list only files likely to be touched

### Risks

* main regression risks
* required safeguards

### Plan

* ordered implementation steps

---

## Rules

* prefer the smallest possible change set
* do not implement anything
* do not expand scope
* do not include unrelated improvements
