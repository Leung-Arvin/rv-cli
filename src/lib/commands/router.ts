import { c } from '../terminal/ansi';
import type { VirtualFileSystem } from '../vfs/types';
import { commandMap, commands } from './handlers/index';
import { fail, ok, type CommandResult, type TerminalWriter } from './types';

/** Splits on Whitespace but keeps quoted Runs together, so `cat "A Name.md"` works. */
export function tokenize(line: string): string[] {
	const tokens: string[] = [];
	const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(line)) !== null) {
		tokens.push(match[1] ?? match[2] ?? match[3]);
	}
	return tokens;
}

function nearest(name: string): string | undefined {
	return commands.find((command) => !command.hidden && command.name.startsWith(name[0]))?.name;
}

export async function run(
	line: string,
	state: { currentDirectory: string; vfs: VirtualFileSystem; columns?: number },
	term: TerminalWriter,
	signal: AbortSignal
): Promise<CommandResult> {
	const [name, ...args] = tokenize(line);
	if (!name) return ok();

	const handler = commandMap.get(name);
	if (!handler) {
		term.writeError(`rv: ${name}: I do not know that One.`);
		const guess = nearest(name);
		term.writeLine(c.dim(guess ? `Did You mean \`${guess}\`? Otherwise \`help\`.` : 'Try `help`.'));
		return fail();
	}

	try {
		return await handler.execute(
			{
				currentDirectory: state.currentDirectory,
				vfs: state.vfs,
				args,
				columns: state.columns ?? 80
			},
			term,
			signal
		);
	} catch (error) {
		term.writeError(`${name}: that broke, which is My Fault and not Yours.`);
		console.error(error);
		return fail();
	}
}
