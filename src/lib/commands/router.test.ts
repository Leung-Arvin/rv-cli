import { describe, expect, it } from 'vitest';
import { buildVfs } from '../vfs/build';
import { run, tokenize } from './router';
import type { TerminalWriter } from './types';

const vfs = buildVfs(
	{
		'/content/About.md': 'I write Software.',
		'/content/Blog/first.md': 'Hello.',
		'/content/Blog/second.md': 'Also Hello.'
	},
	{}
);

function recorder() {
	const lines: string[] = [];
	const writer: TerminalWriter = {
		write: (text) => lines.push(text),
		writeLine: (text) => lines.push(text),
		writeError: (text) => lines.push(text),
		clear: () => lines.splice(0, lines.length)
	};
	// Colors would make every Assertion unreadable.
	return { writer, text: () => lines.join('\n').replace(/\x1b\[[0-9;]*m/g, '') };
}

const exec = async (line: string, currentDirectory = '') => {
	const { writer, text } = recorder();
	const result = await run(line, { currentDirectory, vfs }, writer, new AbortController().signal);
	return { result, text: text() };
};

describe('tokenize', () => {
	it('keeps a quoted Question in one Piece', () => {
		expect(tokenize('cat "Why a Terminal.md"')).toEqual(['cat', 'Why a Terminal.md']);
	});
});

describe('ls', () => {
	it('lists the current Directory when given no Argument', async () => {
		const { text } = await exec('ls', '/Blog');
		expect(text).toContain('first.md');
		expect(text).not.toContain('About.md');
	});

	it('lists Home from Home', async () => {
		const { text } = await exec('ls');
		expect(text).toContain('About.md');
		expect(text).toContain('Blog/');
	});
});

describe('cd', () => {
	it('moves into a Directory', async () => {
		const { result } = await exec('cd Blog');
		expect(result.newDirectory).toBe('/Blog');
	});

	it('refuses a File and points at cat', async () => {
		const { result, text } = await exec('cd About.md');
		expect(result.exitCode).toBe(1);
		expect(text).toContain('cat About.md');
	});
});

describe('cat', () => {
	it('reads a File', async () => {
		const { text } = await exec('cat About.md');
		expect(text).toContain('I write Software.');
	});
});

describe('theme', () => {
	it('accepts a known Theme and rejects an Invention', async () => {
		expect((await exec('theme paper')).result.newTheme).toBe('paper');
		expect((await exec('theme neon')).result.exitCode).toBe(1);
	});
});

describe('unknown Commands', () => {
	it('answers instead of going silent', async () => {
		const { result, text } = await exec('lss');
		expect(result.exitCode).toBe(1);
		expect(text).toContain('I do not know that One');
	});

	it('still has something to say to sudo', async () => {
		const { text } = await exec('sudo rm -rf /');
		expect(text).toContain('Sudoers');
	});
});
