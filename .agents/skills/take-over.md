---
name: take-over
description: The finalization sequence: Review, test, commit, and report.
---
Execute the following sequence autonomously:
1. Trigger the `review-plus-fix` skill.
2. Run the E2E test suite. If tests fail, diagnose and fix the code, then re-test until all pass.
3. Once all tests pass perfectly, trigger the `commit` skill.
4. Provide a final status summary of the completed task.