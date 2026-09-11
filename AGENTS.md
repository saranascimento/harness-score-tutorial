# AGENTS.md

Meeting Cost CLI: utilitário de linha de comando em Node.js que calcula o
custo total de mão de obra de uma reunião a partir do número de
participantes, da duração em minutos e do custo por hora. Sem rede, sem
persistência, sem interface gráfica.

## Estrutura e comandos

- `package.json` — `"type": "module"`, `engines.node >= 24`, `main:
  src/cli.js`. Scripts reais: `start`, `test`, `lint`, `format`,
  `typecheck`, `check` (roda lint, typecheck e testes, nessa ordem).
- `src/cli.js` — ponto de entrada. Lê `process.argv`, chama
  `calculateMeetingCost`, formata a saída em pt-BR, trata erros.
- `src/meetingCost.js` — domínio puro. Exporta `calculateMeetingCost`, com
  JSDoc (`@param`, `@returns`, `@throws`) verificado por `tsc --checkJs`.
- `test/meetingCost.test.js` — testes com o test runner nativo do Node
  (`node:test`).
- `tsconfig.json`, `biome.json` — configuração de typecheck estrito e de
  lint/formatação (Biome).
- `.github/workflows/ci.yml` — roda `npm ci`, lint, typecheck e testes em
  push para `main` e em pull requests, com permissão somente de leitura de
  `contents`.
- `README.md`, `PROJETO.md`, `LICENSE` — não alterar sem pedido explícito.
- Não existem CI de deploy, hooks, MCP ou subagentes neste repositório.
  Não presuma a existência desses artefatos.
- Comando real: `npm start -- <participantes> <duracao_em_minutos>
  <custo_por_hora>` (ex.: `npm start -- 6 45 120`).
- Verificação: siga `.agents/workflows/verify.md` (não duplicado aqui).

## Invariantes de domínio

Fórmula: `participants * (durationMinutes / 60) * hourlyRate`.

- `participants`, `durationMinutes`, `hourlyRate` devem ser números
  finitos.
- `participants >= 1`.
- `durationMinutes > 0`.
- `hourlyRate >= 0` (zero é válido).

Validação vive em `calculateMeetingCost` (lança `Error` com mensagem clara
em português). `src/cli.js` captura o erro, imprime via `console.error`
com prefixo `"Erro: "` e define `process.exitCode = 1`. Preserve esse
padrão em qualquer nova validação.

## Dependências e ESM

Projeto ESM puro (`"type": "module"`), sem dependências de runtime, Node.js
24+. `devDependencies` fixadas: `@biomejs/biome` 2.5.3, `typescript` 5.9.3,
`@types/node` 24.13.3. Não adicione dependências sem necessidade clara; se
adicionar, atualize o `package-lock.json` correspondente.

## Limites de segurança

Não adicione: chamadas de rede, telemetria, leitura/escrita de arquivos
arbitrários, execução dinâmica de código (`eval`, shell a partir de
entrada do usuário), ou segredos/credenciais no repositório.

## Restrições do agente

Sem pedido explícito, não: mude as invariantes de domínio acima; altere
`README.md`, `PROJETO.md` ou `LICENSE`; adicione dependências de runtime,
hooks, MCP, subagentes, pre-commit, workflow do Harness Score ou CI de
deploy; invente comandos ou arquivos inexistentes; faça commit.

## Checklist de conclusão

- [ ] `npm run check` passa (lint, typecheck e testes).
- [ ] ESM puro, Node.js 24+, sem dependências de runtime não solicitadas.
- [ ] Erros lançam `Error` claro e são tratados em `src/cli.js`
      (`console.error` + `process.exitCode = 1`).
- [ ] Nenhum arquivo fora do escopo pedido foi alterado.
- [ ] Nenhum commit feito sem solicitação explícita.
