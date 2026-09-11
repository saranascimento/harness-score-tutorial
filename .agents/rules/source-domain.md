---
description: Domain and architecture rules for the Meeting Cost CLI calculation source code.
globs: src/**
alwaysApply: false
---

# Source domain rules

- `calculateMeetingCost` (`src/meetingCost.js`) is the single source of
  truth for the cost formula and its validation. Do not duplicate the
  formula or the validation logic elsewhere.
- Formula: `participants * (durationMinutes / 60) * hourlyRate`. Any change
  to this formula is a domain change and must keep the invariants below.
- Invariants enforced by `calculateMeetingCost`:
  - `participants`, `durationMinutes`, `hourlyRate` must all be finite
    numbers.
  - `participants >= 1`.
  - `durationMinutes > 0`.
  - `hourlyRate >= 0` (zero is valid).
- Keep the domain (`src/meetingCost.js`) free of I/O: no `console.log`,
  `process.argv`, or `process.exit` in this file. Argument parsing and
  terminal output belong only in `src/cli.js`.
- Validation failures must throw `Error` with a clear, actionable message
  in Portuguese. Do not return `null`/`undefined` or silently coerce
  invalid input.
- `src/cli.js` is the only place that reads `process.argv`, formats output,
  and sets `process.exitCode`. It wraps calls to the domain in `try`/
  `catch` and must keep doing so for any new domain call.
- This project is ESM-only (`"type": "module"`) with no runtime
  dependencies. Do not introduce `require`/`module.exports` or add a
  runtime dependency without clear need.
