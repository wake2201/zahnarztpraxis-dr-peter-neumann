---

name: risk-level
description: Classifies the requested task by implementation risk before any code changes are made.
---------------------------------------------------------------------------------------------------

Analyze the requested task BEFORE any implementation.

Classify the task into exactly one of the following levels:

---

## LOW

Small, localized changes with minimal impact.

Examples:

* Text fixes
* Minor UI adjustments
* Small validation tweaks
* Logging replacement
* Non-structural cleanup

Characteristics:

* Single file or very limited scope
* No impact on critical logic
* Very low regression risk

---

## MEDIUM

Changes affecting one subsystem with moderate risk.

Examples:

* Server Action changes
* Prisma query adjustments
* Rate-limit modifications
* Component interaction changes
* Localized auth logic updates

Characteristics:

* One logical system affected
* Some regression risk
* Requires verification

---

## HIGH

Changes affecting multiple systems or security-sensitive logic.

Examples:

* Auth flow modifications
* Middleware changes
* CSP adjustments
* Schema or data flow changes
* Cross-file transaction logic
* Role or permission logic

Characteristics:

* Multiple files or layers involved
* High regression risk
* Potential security implications

---

## CRITICAL

Changes that can break core system integrity or security.

Examples:

* Session handling changes
* Login lockout logic
* Database consistency guarantees
* Removal or weakening of validation
* Architecture-level changes
* Security boundary changes

Characteristics:

* System-wide impact
* High probability of critical failure if incorrect
* Requires extreme caution

---

## Required Output

Return:

### Risk Level

* LOW / MEDIUM / HIGH / CRITICAL

### Reasoning

* Why this classification applies

### Affected Areas

* Systems, layers, or files involved

### Failure Modes

* Concrete things that can break (e.g. auth bypass, data loss, inconsistent DB state, UI regression)

### Safeguards

* What must be verified before implementation

### Confidence

* low / medium / high

---

## Rules

* Be conservative in classification
* If uncertain → choose the higher risk level
* Do NOT implement anything
* Do NOT expand the task
* Focus strictly on classification and risk analysis

---

## 🚨 Execution Gate

If risk level is HIGH or CRITICAL:

* Implementation MUST NOT start without a validated plan
* All risks MUST be explicitly understood
* If risks are unclear → STOP
