/**
 * Cursor `afterFileEdit` feedback hook.
 *
 * Reads the hook payload as JSON from stdin and runs the repository's
 * local Biome formatter on the edited file, only for the JavaScript and
 * JSON files Biome is configured to format here. This is guidance for
 * the agent loop only, applied best-effort; CI remains the source of
 * truth for formatting. This event supports no output fields, so the
 * hook never writes to stdout and never blocks the agent.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const FORMATTABLE_EXTENSIONS = new Set([".js", ".cjs", ".mjs", ".json"]);

async function readStdin() {
	process.stdin.setEncoding("utf8");
	let data = "";
	for await (const chunk of process.stdin) {
		data += chunk;
	}
	return data;
}

function resolveBiomeBinary() {
	const binName = process.platform === "win32" ? "biome.cmd" : "biome";
	const local = path.join(REPO_ROOT, "node_modules", ".bin", binName);
	return existsSync(local) ? local : null;
}

async function main() {
	let payload;
	try {
		payload = JSON.parse(await readStdin());
	} catch {
		return;
	}

	const filePath =
		payload &&
		typeof payload === "object" &&
		typeof payload.file_path === "string"
			? payload.file_path
			: null;
	if (!filePath) return;

	const absolutePath = path.isAbsolute(filePath)
		? filePath
		: path.join(REPO_ROOT, filePath);
	if (
		!(
			absolutePath === REPO_ROOT ||
			absolutePath.startsWith(REPO_ROOT + path.sep)
		)
	)
		return;
	if (!existsSync(absolutePath)) return;

	const extension = path.extname(absolutePath).toLowerCase();
	if (!FORMATTABLE_EXTENSIONS.has(extension)) return;

	const biome = resolveBiomeBinary();
	if (!biome) return;

	spawnSync(biome, ["format", "--write", absolutePath], {
		cwd: REPO_ROOT,
		stdio: "ignore",
	});
}

main();
