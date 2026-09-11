import { calculateMeetingCost } from "./meetingCost.js";

function parseArgs(argv) {
  const [participantsArg, durationMinutesArg, hourlyRateArg] = argv;

  if (
    participantsArg === undefined ||
    durationMinutesArg === undefined ||
    hourlyRateArg === undefined
  ) {
    throw new Error(
      "Uso: npm start -- <participantes> <duracao_em_minutos> <custo_por_hora>"
    );
  }

  return {
    participants: Number(participantsArg),
    durationMinutes: Number(durationMinutesArg),
    hourlyRate: Number(hourlyRateArg),
  };
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function main() {
  const argv = process.argv.slice(2);

  let input;
  try {
    input = parseArgs(argv);
    const totalCost = calculateMeetingCost(input);
    console.log(
      `Custo total da reunião: R$ ${formatCurrency(totalCost)} ` +
        `(${input.participants} participantes, ${input.durationMinutes} min, ` +
        `R$ ${formatCurrency(input.hourlyRate)}/h)`
    );
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
