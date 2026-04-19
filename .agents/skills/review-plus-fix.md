---
name: review-plus-fix
description: Iterative loop to review changes and apply fixes until the code matches architectural standards.
---
1. Execute the `review-dirty` skill to identify architectural violations.
2. Apply the necessary code fixes to resolve the identified issues.
3. Re-evaluate the codebase. Repeat this process autonomously until no further violations are detected.
4. Report when the codebase is perfectly aligned with `ARCHITECTURE.md`.