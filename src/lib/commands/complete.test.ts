import { describe, expect, it } from 'vitest';
import { buildVfs } from '../vfs/build';
import { columnize, complete } from './complete';

const vfs = buildVfs({
	'/content/About.md': 'I write Software.',
	'/content/Blog/why-a-terminal.md': 'Hello.',
	'/content/Blog/why-i-left.md': 'Also Hello.',
	'/content/Projects/rv-cli.md': 'This Site.'
});

const at = (line: string, currentDirectory = '') =>
	complete(line, line.length, { currentDirectory, vfs });

describe('command Completion', () => {
	it('finishes a Command that is the only Match', () => {
		expect(at('pw').line).toBe('pwd ');
	});

	it('lists the Options when the Word cannot be extended', () => {
		// cd, cat and clear all start with c, so no further Character is certain.
		const result = at('c');
		expect(result.line).toBe('c');
		expect(result.candidates).toEqual(expect.arrayContaining(['cd', 'cat', 'clear']));
	});

	it('extends as far as the Candidates agree', () => {
		// feedback is the only Command starting with f.
		expect(at('f').line).toBe('feedback ');
	});

	it('leaves the Line alone when nothing matches', () => {
		expect(at('zzz')).toEqual({ line: 'zzz', cursor: 3, candidates: [] });
	});

	it('keeps the Easter Eggs secret', () => {
		expect(at('sud').candidates).toEqual([]);
		expect(at('sud').line).toBe('sud');
	});
});

describe('path Completion', () => {
	it('completes a Directory and invites another Segment', () => {
		expect(at('cd Blo').line).toBe('cd Blog/');
	});

	it('completes a File and ends the Word', () => {
		expect(at('cat Abo').line).toBe('cat About.md ');
	});

	it('descends into a Directory that was already typed', () => {
		// Both Blog Entries share `why-`, so a Shell extends rather than lists.
		expect(at('cat Blog/').line).toBe('cat Blog/why-');
	});

	it('lists the Directory when its Entries share nothing', () => {
		expect(at('cat ').candidates).toEqual(['Projects/', 'Blog/', 'About.md']);
	});

	it('extends to the shared Prefix inside a Directory', () => {
		expect(at('cat Blog/why-').line).toBe('cat Blog/why-');
		expect(at('cat Blog/why-a').line).toBe('cat Blog/why-a-terminal.md ');
	});

	it('completes relative to where You are, not Home', () => {
		expect(at('cat why-a', '/Blog').line).toBe('cat why-a-terminal.md ');
	});

	it('handles an absolute Path', () => {
		expect(at('cd /Proj', '/Blog').line).toBe('cd /Projects/');
	});
});

describe('columnize', () => {
	it('wraps to the available Width', () => {
		expect(columnize(['aa', 'bb', 'cc'], 10)).toEqual(['aa  bb', 'cc']);
	});

	it('always gives at least one Column', () => {
		expect(columnize(['a-very-long-name'], 4)).toEqual(['a-very-long-name']);
	});
});
