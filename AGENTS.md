# AGENTS.md

Meeting Cost CLI: utilitário de linha de comando em Node.js que calcula o
custo total de mão de obra de uma reunião a partir do número de
participantes, da duração em minutos e do custo por hora. Sem rede, sem
persistência, sem interface gráfica.

## Estrutura e comandos

- `package.json` — `"type": "module"`, `engines.node >= 24`, script
  `start`, `main: src/cli.js`. Nenhum script de teste, lint, formatação,
  typecheck ou build existe hoje. Não os invente.
- `src/cli.js` — ponto de entrada. Lê `process.argv`, chama
  `calculateMeetingCost`, formata a saída em pt-BR, trata erros.
- `src/meetingCost.js` — domínio puro. Exporta `calculateMeetingCost`.
- `README.md`, `PROJETO.md`, `LICENSE` — não alterar sem pedido explícito.
- Não existem testes, lint, CI, hooks, rules, skills ou MCP neste
  repositório. Não presuma a existência desses artefatos.
- Comando real: `npm start -- <participantes> <duracao_em_minutos>
  <custo_por_hora>` (ex.: `npm start -- 6 45 120`).
- Não há `package-lock.json` (nenhuma dependência instalada).

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
24+. Não adicione dependências sem necessidade clara; se adicionar, gere o
`package-lock.json` correspondente.

## Limites de segurança

Não adicione: chamadas de rede, telemetria, leitura/escrita de arquivos
arbitrários, execução dinâmica de código (`eval`, shell a partir de
entrada do usuário), ou segredos/credenciais no repositório.

## Restrições do agente

Sem pedido explícito, não: mude as invariantes de domínio acima; altere
`README.md`, `PROJETO.md` ou `LICENSE`; adicione dependências, testes,
lint, CI, hooks, rules, skills ou MCP; invente comandos ou arquivos
inexistentes; faça commit.

## Checklist de conclusão

- [ ] Invariantes de domínio preservadas e validadas manualmente com
      `npm start -- ...`.
- [ ] ESM puro, Node.js 24+, sem dependências de runtime não solicitadas.
- [ ] Erros lançam `Error` claro e são tratados em `src/cli.js`
      (`console.error` + `process.exitCode = 1`).
- [ ] Nenhum arquivo fora do escopo pedido foi alterado.
- [ ] Nenhum commit feito sem solicitação explícita.
