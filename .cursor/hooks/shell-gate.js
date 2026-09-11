/**
 * Cursor `beforeShellExecution` gate hook.
 *
 * Reads the hook payload as JSON from stdin, decides whether the shell
 * command should be allowed, denied, or sent back for manual approval,
 * and writes the decision as JSON to stdout. Node.js built-ins only, no
 * dependencies.
 */

async function readStdin() {
	process.stdin.setEncoding("utf8");
	let data = "";
	for await (const chunk of process.stdin) {
		data += chunk;
	}
	return data;
}

function splitCommandChain(command) {
	return command.split(/&&|\|\||;|\|/);
}

function tokenize(subcommand) {
	return subcommand.trim().split(/\s+/).filter(Boolean);
}

function hasShortFlagLetter(tokens, letter) {
	return tokens.some(
		(token) =>
			/^-[a-zA-Z]+$/.test(token) &&
			token.slice(1).toLowerCase().includes(letter),
	);
}

function isRootOrHomeTarget(target) {
	const bare = target.replace(/^["']|["']$/g, "");
	// biome-ignore lint/suspicious/noTemplateCurlyInString: literal shell variable syntax, not a template placeholder
	if (["/", "~", "$HOME", "${HOME}"].includes(bare)) return true;
	if (/^\/+$/.test(bare)) return true;
	if (["/*", "~/*", "$HOME/*"].includes(bare)) return true;
	if (/^[a-zA-Z]:\\?$/.test(bare)) return true;
	return false;
}

function isNpmPublish(command) {
	return splitCommandChain(command).some((sub) => {
		const tokens = tokenize(sub);
		const npmIndex = tokens.indexOf("npm");
		if (npmIndex === -1) return false;
		let i = npmIndex + 1;
		while (i < tokens.length && tokens[i].startsWith("-")) i++;
		return tokens[i] === "publish";
	});
}

function isGitForcePush(command) {
	return splitCommandChain(command).some((sub) => {
		const tokens = tokenize(sub);
		if (tokens[0] !== "git") return false;
		if (!tokens.includes("push")) return false;
		if (tokens.includes("--force-with-lease")) return false;
		return tokens.includes("--force") || tokens.includes("-f");
	});
}

function isGitResetHard(command) {
	return splitCommandChain(command).some((sub) => {
		const tokens = tokenize(sub);
		if (tokens[0] !== "git") return false;
		return tokens.includes("reset") && tokens.includes("--hard");
	});
}

function isRecursiveRootRemoval(command) {
	return splitCommandChain(command).some((sub) => {
		let tokens = tokenize(sub);
		if (tokens[0] === "sudo") tokens = tokens.slice(1);
		if (tokens[0] !== "rm") return false;
		const recursive =
			hasShortFlagLetter(tokens, "r") || tokens.includes("--recursive");
		const force = hasShortFlagLetter(tokens, "f") || tokens.includes("--force");
		if (!(recursive && force)) return false;
		const targets = tokens.slice(1).filter((token) => !token.startsWith("-"));
		return targets.some(isRootOrHomeTarget);
	});
}

function isDestructivePowerShellRemoveItem(command) {
	return splitCommandChain(command).some((sub) => {
		const tokens = tokenize(sub);
		if (!tokens.some((token) => token.toLowerCase() === "remove-item"))
			return false;
		const lower = tokens.map((token) => token.toLowerCase());
		const hasRecurse = lower.includes("-recurse");
		const hasForce = lower.includes("-force");
		if (!(hasRecurse && hasForce)) return false;
		const targets = tokens.filter(
			(token) =>
				!token.startsWith("-") && token.toLowerCase() !== "remove-item",
		);
		return targets.some(isRootOrHomeTarget);
	});
}

const DENY_RULES = [
	{ name: "npm publish", test: isNpmPublish },
	{ name: "git push --force", test: isGitForcePush },
	{ name: "git reset --hard", test: isGitResetHard },
	{
		name: "remoção recursiva de uma raiz ou home",
		test: isRecursiveRootRemoval,
	},
	{
		name: "Remove-Item recursivo e forçado do PowerShell",
		test: isDestructivePowerShellRemoveItem,
	},
];

function evaluateCommand(command) {
	for (const rule of DENY_RULES) {
		if (rule.test(command)) {
			return {
				permission: "deny",
				user_message: `Bloqueado pelo gate hook local: ${rule.name}.`,
				agent_message: `O comando foi negado porque corresponde a um padrão destrutivo conhecido (${rule.name}). Escolha uma alternativa mais segura ou peça confirmação explícita ao usuário.`,
			};
		}
	}
	return { permission: "allow" };
}

function askDueToUnreadablePayload() {
	return {
		permission: "ask",
		user_message: "O payload do hook não pôde ser interpretado.",
		agent_message:
			"O gate hook recebeu um payload que não pôde ser interpretado como um comando válido; peça confirmação ao usuário antes de executar.",
	};
}

async function main() {
	let raw;
	try {
		raw = await readStdin();
	} catch {
		process.stdout.write(JSON.stringify(askDueToUnreadablePayload()));
		return;
	}

	let payload;
	try {
		payload = JSON.parse(raw);
	} catch {
		process.stdout.write(JSON.stringify(askDueToUnreadablePayload()));
		return;
	}

	if (
		payload === null ||
		typeof payload !== "object" ||
		typeof payload.command !== "string" ||
		payload.command.trim() === ""
	) {
		process.stdout.write(JSON.stringify(askDueToUnreadablePayload()));
		return;
	}

	process.stdout.write(JSON.stringify(evaluateCommand(payload.command)));
}

main();
