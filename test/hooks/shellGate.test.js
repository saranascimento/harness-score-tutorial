import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GATE_SCRIPT = path.join(
	__dirname,
	"..",
	"..",
	".cursor",
	"hooks",
	"shell-gate.js",
);

/**
 * @param {string} input
 * @returns {{permission: string, user_message?: string, agent_message?: string}}
 */
function runGate(input) {
	const result = spawnSync(process.execPath, [GATE_SCRIPT], {
		input,
		encoding: "utf8",
	});
	assert.equal(
		result.status,
		0,
		`gate script saiu com status ${result.status}: ${result.stderr}`,
	);
	return JSON.parse(result.stdout);
}

test("permite um comando comum", () => {
	const response = runGate(
		JSON.stringify({ command: "npm test", cwd: "/repo" }),
	);
	assert.equal(response.permission, "allow");
});

test("permite git push sem --force", () => {
	const response = runGate(JSON.stringify({ command: "git push origin main" }));
	assert.equal(response.permission, "allow");
});

test("permite git push --force-with-lease", () => {
	const response = runGate(
		JSON.stringify({ command: "git push --force-with-lease" }),
	);
	assert.equal(response.permission, "allow");
});

test("nega npm publish", () => {
	const response = runGate(JSON.stringify({ command: "npm publish" }));
	assert.equal(response.permission, "deny");
});

test("não nega scripts npm cujo nome contém publish", () => {
	const response = runGate(JSON.stringify({ command: "npm run publish-docs" }));
	assert.equal(response.permission, "allow");
});

test("nega git push --force", () => {
	const response = runGate(
		JSON.stringify({ command: "git push --force origin main" }),
	);
	assert.equal(response.permission, "deny");
});

test("nega git reset --hard", () => {
	const response = runGate(
		JSON.stringify({ command: "git reset --hard HEAD~1" }),
	);
	assert.equal(response.permission, "deny");
});

test("nega remoção recursiva da raiz", () => {
	const response = runGate(JSON.stringify({ command: "rm -rf /" }));
	assert.equal(response.permission, "deny");
});

test("nega remoção recursiva do home", () => {
	const response = runGate(JSON.stringify({ command: "sudo rm -rf ~" }));
	assert.equal(response.permission, "deny");
});

test("nega Remove-Item recursivo e forçado do home no PowerShell", () => {
	const response = runGate(
		JSON.stringify({ command: "Remove-Item -Recurse -Force ~" }),
	);
	assert.equal(response.permission, "deny");
});

test("retorna ask quando o payload não é JSON válido", () => {
	const response = runGate("isto não é JSON");
	assert.equal(response.permission, "ask");
});

test("retorna ask quando o payload não tem um comando", () => {
	const response = runGate(JSON.stringify({ cwd: "/repo" }));
	assert.equal(response.permission, "ask");
});

test("retorna ask quando command não é uma string", () => {
	const response = runGate(JSON.stringify({ command: 123 }));
	assert.equal(response.permission, "ask");
});
