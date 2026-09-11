import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMeetingCost } from "../src/meetingCost.js";

test("calcula o custo total para uma entrada válida", () => {
	const result = calculateMeetingCost({
		participants: 5,
		durationMinutes: 30,
		hourlyRate: 120,
	});

	assert.equal(result, 300);
});

test("calcula corretamente durações que não são múltiplos de 60 minutos", () => {
	const result = calculateMeetingCost({
		participants: 1,
		durationMinutes: 10,
		hourlyRate: 100,
	});

	assert.ok(
		Math.abs(result - 16.666666666666668) < 1e-9,
		`esperado aproximadamente 16.666..., recebido ${result}`,
	);
});

test("rejeita menos de um participante", () => {
	assert.throws(
		() =>
			calculateMeetingCost({
				participants: 0,
				durationMinutes: 30,
				hourlyRate: 100,
			}),
		/pelo menos 1/,
	);
});

test("rejeita duração zero ou negativa", () => {
	assert.throws(
		() =>
			calculateMeetingCost({
				participants: 5,
				durationMinutes: 0,
				hourlyRate: 100,
			}),
		/maior que zero/,
	);

	assert.throws(
		() =>
			calculateMeetingCost({
				participants: 5,
				durationMinutes: -10,
				hourlyRate: 100,
			}),
		/maior que zero/,
	);
});

test("rejeita custo por hora negativo", () => {
	assert.throws(
		() =>
			calculateMeetingCost({
				participants: 5,
				durationMinutes: 30,
				hourlyRate: -1,
			}),
		/não pode ser negativo/,
	);
});

test("aceita custo por hora igual a zero", () => {
	const result = calculateMeetingCost({
		participants: 5,
		durationMinutes: 30,
		hourlyRate: 0,
	});

	assert.equal(result, 0);
});

test("rejeita entradas não finitas", () => {
	const cases = [
		{ participants: Number.NaN, durationMinutes: 30, hourlyRate: 100 },
		{
			participants: 5,
			durationMinutes: Number.POSITIVE_INFINITY,
			hourlyRate: 100,
		},
		{
			participants: 5,
			durationMinutes: 30,
			hourlyRate: Number.NEGATIVE_INFINITY,
		},
	];

	for (const input of cases) {
		assert.throws(() => calculateMeetingCost(input), /números finitos/);
	}
});
