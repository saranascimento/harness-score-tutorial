---
name: verify
description: Manual verification steps to run after changing the Meeting Cost CLI, using only commands that exist in this repository today.
---

# Verify changes

Run only the commands below. Do not invent `npm test`, `npm run lint`, or
`npm run typecheck` — none of these scripts exist in `package.json` yet.

1. `npm start -- 6 45 120`
   Confirm it prints a total cost and does not throw.
2. `npm start -- 0 45 120`
   Confirm it prints `Erro: O número de participantes deve ser pelo menos 1.`
   and exits non-zero.
3. `npm start -- 6 0 120`
   Confirm it prints `Erro: A duração da reunião deve ser maior que zero.`
   and exits non-zero.
4. `npm start -- 6 45 -1`
   Confirm it prints `Erro: O custo por hora não pode ser negativo.` and
   exits non-zero.
5. `npm start -- NaN 45 120`
   Confirm it prints
   `Erro: Participantes, duração e custo por hora devem ser números finitos.`
   and exits non-zero.
6. `git diff --stat`
   Confirm only the intended files changed.

## Pending sensors

Automated tests, lint, formatting, and typecheck are not configured in
this repository. Treat them as pending sensors, not as available commands.
Do not report a task as fully verified based on tooling that does not
exist yet; rely on the manual steps above until those sensors are added in
a future step.
