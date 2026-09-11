---
name: add-calculation-case
description: Use when adding or changing a meeting cost calculation rule, such as a new validation, edge case, or a change to the cost formula itself.
---

# Add or change a calculation case

Repeatable process for modifying `calculateMeetingCost` in
`src/meetingCost.js` without breaking existing invariants.

## Steps

1. Read `src/meetingCost.js` first. Understand the current formula
   (`participants * (durationMinutes / 60) * hourlyRate`) and the current
   validation order: finite check, then `participants >= 1`, then
   `durationMinutes > 0`, then `hourlyRate >= 0`.
2. Decide whether the change is a new validation (a new rejected input
   shape) or a formula change (how a valid input is priced). Keep the two
   concerns separate in the diff.
3. Implement the change inside `calculateMeetingCost` only. Do not move
   validation or formula logic into `src/cli.js`.
4. For a new validation, throw `Error` with a clear, actionable message in
   Portuguese, consistent with the existing messages in the function.
5. Consider these edge cases explicitly and decide the expected behavior
   for each before writing code:
   - Zero participants, and fractional participants.
   - Zero duration, negative duration, and very large duration.
   - Zero hourly rate, and negative hourly rate.
   - Non-finite input (`NaN`, `Infinity`, `-Infinity`), and non-numeric
     strings that fail `Number()` conversion in `src/cli.js`.
   - Values at the exact boundary of a new rule (e.g. the smallest valid
     value versus the largest invalid value).
6. If the change affects how arguments are read or how output is
   formatted, update `src/cli.js` accordingly, keeping I/O out of
   `src/meetingCost.js`.

## Verification

There is no automated test suite in this repository yet. Verify manually:

1. Run `npm start -- <participants> <duracao_em_minutos> <custo_por_hora>`
   with a known-valid case and confirm the printed total matches a
   hand-calculated expectation.
2. Run it again for each edge case identified in step 5, once with a value
   just inside the valid range and once just outside it, and confirm the
   valid case prints a result while the invalid case prints
   `Erro: <message>` and exits with a non-zero code.
3. Re-read the updated `src/meetingCost.js` to confirm the domain function
   still contains no `console.log`, `process.argv`, or `process.exit`.
