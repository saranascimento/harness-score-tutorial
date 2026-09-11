import { calculateMeetingCost } from "./meetingCost.js";

/**
 * @typedef {object} ParsedArgs
 * @property {number} participants
 * @property {number} durationMinutes
 * @property {number} hourlyRate
 */

/**
 * Parses the three positional CLI arguments into numeric meeting cost
 * inputs. Does not validate numeric ranges; that is the domain's job.
 *
 * @param {string[]} argv
 * @returns {ParsedArgs}
 * @throws {Error} If any of the three positional arguments is missing.
 */
function parseArgs(argv) {
	const [participantsArg, durationMinutesArg, hourlyRateArg] = argv;

	if (
		participantsArg === undefined ||
		durationMinutesArg === undefined ||
		hourlyRateArg === undefined
	) {
		throw new Error(
			"Uso: npm start -- <participantes> <duracao_em_minutos> <custo_por_hora>",
		);
	}

	return {
		participants: Number(participantsArg),
		durationMinutes: Number(durationMinutesArg),
		hourlyRate: Number(hourlyRateArg),
	};
}

/**
 * Formats a number as pt-BR currency with exactly two decimal digits.
 *
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
	return value.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

/**
 * CLI entry point: reads arguments, computes the meeting cost, and prints
 * the result or an actionable error message.
 *
 * @returns {void}
 */
function main() {
	const argv = process.argv.slice(2);

	let input;
	try {
		input = parseArgs(argv);
		const totalCost = calculateMeetingCost(input);
		console.log(
			`Custo total da reunião: R$ ${formatCurrency(totalCost)} ` +
				`(${input.participants} participantes, ${input.durationMinutes} min, ` +
				`R$ ${formatCurrency(input.hourlyRate)}/h)`,
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Erro: ${message}`);
		process.exitCode = 1;
	}
}

main();
