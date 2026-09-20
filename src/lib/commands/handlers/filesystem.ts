import { c, padEnd } from '../../terminal/ansi';
import { renderMarkdown } from '../../terminal/markdown';
import { displayPath, listDir, lookup, resolvePath } from '../../vfs/navigator';
import { fail, ok, type CommandHandler } from '../types';

export const ls: CommandHandler = {
	name: 'ls',
	description: 'List what is in here',
	async execute(ctx, term) {
		// No Argument means Here. An empty String would resolve to Home instead.
		const target = ctx.args[0]
			? resolvePath(ctx.currentDirectory, ctx.args[0])
			: ctx.currentDirectory;
		const node = lookup(ctx.vfs, target);

		if (!node) {
			term.writeError(`ls: ${ctx.args[0]}: no such File or Directory`);
			return fail();
		}

		if (node.kind === 'file') {
			term.writeLine(c.file(node.name));
			return ok();
		}

		const entries = listDir(node);
		if (entries.length === 0) {
			term.writeLine(c.dim('Empty. I have not written this Part yet.'));
			return ok();
		}

		const width = Math.max(...entries.map((entry) => entry.name.length)) + 6;
		for (const entry of entries) {
			const label = entry.kind === 'dir' ? c.dir(`${entry.name}/`) : c.file(entry.name);
			const note = entry.description ?? (entry.kind === 'file' ? entry.date : '') ?? '';
			term.writeLine(padEnd(label, width) + (note ? c.dim(note) : ''));
		}
		return ok();
	}
};

export const cd: CommandHandler = {
	name: 'cd',
	description: 'Go somewhere else',
	async execute(ctx, term) {
		const target = resolvePath(ctx.currentDirectory, ctx.args[0] ?? '');
		const node = lookup(ctx.vfs, target);

		if (!node) {
			term.writeError(`cd: ${ctx.args[0]}: no such Directory`);
			return fail();
		}
		if (node.kind === 'file') {
			term.writeError(`cd: ${node.name} is a File. Try ${c.prompt(`cat ${node.name}`)}`);
			return fail();
		}
		return ok({ newDirectory: target });
	}
};

export const pwd: CommandHandler = {
	name: 'pwd',
	description: 'Say where You are',
	async execute(ctx, term) {
		term.writeLine(c.dir(displayPath(ctx.currentDirectory)));
		return ok();
	}
};

export const cat: CommandHandler = {
	name: 'cat',
	description: 'Read a File',
	async execute(ctx, term) {
		if (ctx.args.length === 0) {
			term.writeError('cat: I need a File. Run `ls` to see what is around.');
			return fail();
		}

		const target = resolvePath(ctx.currentDirectory, ctx.args[0]);
		const node = lookup(ctx.vfs, target);

		if (!node) {
			term.writeError(`cat: ${ctx.args[0]}: no such File`);
			return fail();
		}
		if (node.kind === 'dir') {
			term.writeError(`cat: ${node.name} is a Directory. Try ${c.prompt(`cd ${node.name}`)}`);
			return fail();
		}

		term.writeLine('');
		for (const line of renderMarkdown(node.text)) term.writeLine(line);
		term.writeLine('');
		return ok();
	}
};
