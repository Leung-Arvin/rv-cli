import { descriptions, order } from '../../../content.config';
import type { DirNode, FileNode, VfsNode, VirtualFileSystem } from './types';

interface FrontMatter {
	description?: string;
	date?: string;
}

function parseFrontMatter(raw: string): { meta: FrontMatter; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!match) return { meta: {}, body: raw };

	const meta: FrontMatter = {};
	for (const line of match[1].split(/\r?\n/)) {
		const sep = line.indexOf(':');
		if (sep === -1) continue;
		const key = line.slice(0, sep).trim();
		const value = line.slice(sep + 1).trim();
		if (key === 'description' || key === 'date') meta[key] = value;
	}
	return { meta, body: raw.slice(match[0].length) };
}

function emptyDir(name: string, path: string): DirNode {
	return { kind: 'dir', name, path, description: descriptions[path], children: new Map() };
}

const MEDIA_TYPES: Record<string, string> = {
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	webp: 'image/webp'
};

function mediaTypeOf(name: string): string | undefined {
	return MEDIA_TYPES[name.split('.').pop()?.toLowerCase() ?? ''];
}

/** Walks a glob Key into the Tree, creating Directories on the Way. */
function placeFile(root: DirNode, key: string): { dir: DirNode; name: string } {
	const segments = key.replace(/^\/content\//, '').split('/');
	const name = segments.pop() ?? '';

	let dir = root;
	for (const segment of segments) {
		const path = `${dir.path}/${segment}`;
		let next = dir.children.get(segment);
		if (!next || next.kind !== 'dir') {
			next = emptyDir(segment, path);
			dir.children.set(segment, next);
		}
		dir = next;
	}
	return { dir, name };
}

/**
 * Builds the Filesystem from content/ at Build time. Vite inlines every Match,
 * so nothing is fetched at Runtime and `ls` never waits on the Network.
 */
export function buildVfs(
	modules: Record<string, string> = import.meta.glob('/content/**/*.md', {
		eager: true,
		query: '?raw',
		import: 'default'
	}) as Record<string, string>,
	assets: Record<string, string> = import.meta.glob('/content/**/*.{png,jpg,jpeg,gif,webp}', {
		eager: true,
		query: '?url',
		import: 'default'
	}) as Record<string, string>
): VirtualFileSystem {
	const root = emptyDir('', '');

	for (const [key, url] of Object.entries(assets)) {
		const { dir, name } = placeFile(root, key);
		dir.children.set(name, {
			kind: 'file',
			name,
			path: `${dir.path}/${name}`,
			text: '',
			url,
			mediaType: mediaTypeOf(name),
			description: descriptions[`${dir.path}/${name}`]
		});
	}

	for (const [key, raw] of Object.entries(modules)) {
		const { dir, name: fileName } = placeFile(root, key);
		const path = `${dir.path}/${fileName}`;
		const { meta, body } = parseFrontMatter(raw);
		const file: FileNode = {
			kind: 'file',
			name: fileName,
			path,
			text: body.trim(),
			description: meta.description ?? descriptions[path],
			date: meta.date
		};
		dir.children.set(fileName, file);
	}

	return { root };
}

/**
 * Directories first, then anything named in the configured Order, then newest
 * first for Entries that carry a Date, then alphabetical. Careers and Blog Posts
 * both want Recency, and neither should need listing in Config to get It.
 */
export function sortEntries(nodes: VfsNode[]): VfsNode[] {
	return [...nodes].sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;

		const ai = order.indexOf(a.name);
		const bi = order.indexOf(b.name);
		if (ai !== -1 && bi !== -1) return ai - bi;
		if (ai !== -1) return -1;
		if (bi !== -1) return 1;

		const aDate = a.kind === 'file' ? a.date : undefined;
		const bDate = b.kind === 'file' ? b.date : undefined;
		if (aDate && bDate && aDate !== bDate) return aDate < bDate ? 1 : -1;
		if (aDate !== undefined && bDate === undefined) return -1;
		if (bDate !== undefined && aDate === undefined) return 1;

		return a.name.localeCompare(b.name);
	});
}
