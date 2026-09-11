---
name: verify
description: Verification steps to run after changing the Meeting Cost CLI, using only commands that exist in this repository today.
---

# Verify changes

1. `npm run check`
   Runs lint (Biome), typecheck (tsc, strict, checkJs), and tests (node
   --test) in that order. Fix any failure before considering the change
   done.
2. `npm start -- 6 45 120`
   Manually confirm the CLI still prints a total cost for a valid input.
3. `git diff --stat`
   Confirm only the intended files changed.

Do not invent commands beyond `npm run check`, `npm run lint`,
`npm run typecheck`, `npm test`, `npm run format`, and `npm start`. No
other scripts exist in `package.json`.
