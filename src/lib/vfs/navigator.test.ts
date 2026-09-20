import { describe, expect, it } from 'vitest';
import { buildVfs } from './build';
import { displayPath, listDir, lookup, resolvePath } from './navigator';

const vfs = buildVfs({
	'/content/About.md': 'I write Software.',
	'/content/Blog/first.md': '---\ndate: 2026-01-02\n---\nHello.',
	'/content/Blog/second.md': 'Also Hello.'
});

describe('resolvePath', () => {
	it('treats Home, tilde and empty as the Root', () => {
		expect(resolvePath('/Blog', '~')).toBe('');
		expect(resolvePath('/Blog', '')).toBe('');
		expect(resolvePath('/Blog', '/')).toBe('');
	});

	it('walks relative Segments', () => {
		expect(resolvePath('', 'Blog')).toBe('/Blog');
		expect(resolvePath('/Blog', '..')).toBe('');
		expect(resolvePath('/Blog', './../Blog')).toBe('/Blog');
	});

	it('stops at the Root instead of escaping It', () => {
		expect(resolvePath('', '../../..')).toBe('');
	});
});

describe('lookup', () => {
	it('finds Directories and Files', () => {
		expect(lookup(vfs, '')?.kind).toBe('dir');
		expect(lookup(vfs, '/Blog')?.kind).toBe('dir');
		expect(lookup(vfs, '/About.md')?.kind).toBe('file');
	});

	it('returns nothing for a Path that is not there', () => {
		expect(lookup(vfs, '/Nope')).toBeUndefined();
		expect(lookup(vfs, '/About.md/deeper')).toBeUndefined();
	});
});

describe('listDir', () => {
	it('puts Directories before Files', () => {
		const names = listDir(vfs.root).map((node) => node.name);
		expect(names).toEqual(['Blog', 'About.md']);
	});
});

describe('displayPath', () => {
	it('renders Home as a Tilde', () => {
		expect(displayPath('')).toBe('~');
		expect(displayPath('/Blog')).toBe('~/Blog');
	});
});
