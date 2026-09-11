export function calculateMeetingCost({ participants, durationMinutes, hourlyRate }) {
  if (![participants, durationMinutes, hourlyRate].every(Number.isFinite)) {
    throw new Error(
      "Participantes, duração e custo por hora devem ser números finitos."
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
