/**
 * @typedef {object} MeetingCostInput
 * @property {number} participants - Number of people attending the meeting.
 * @property {number} durationMinutes - Meeting duration in minutes.
 * @property {number} hourlyRate - Labor cost per participant, per hour.
 */

/**
 * Calculates the total labor cost of a meeting.
 *
 * @param {MeetingCostInput} input
 * @returns {number} Total meeting cost.
 * @throws {Error} If any input is not a finite number, `participants` is
 *   less than 1, `durationMinutes` is not greater than 0, or `hourlyRate`
 *   is negative.
 */
export function calculateMeetingCost({
	participants,
	durationMinutes,
	hourlyRate,
}) {
	if (![participants, durationMinutes, hourlyRate].every(Number.isFinite)) {
		throw new Error(
			"Participantes, duração e custo por hora devem ser números finitos.",
		);
	}

	if (participants < 1) {
		throw new Error("O número de participantes deve ser pelo menos 1.");
	}

	if (durationMinutes <= 0) {
		throw new Error("A duração da reunião deve ser maior que zero.");
	}

	if (hourlyRate < 0) {
		throw new Error("O custo por hora não pode ser negativo.");
	}

	return participants * (durationMinutes / 60) * hourlyRate;
}
