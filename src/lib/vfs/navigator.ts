import { hidden } from '../../../content.config';
import { sortEntries } from './build';
import type { DirNode, VfsNode, VirtualFileSystem } from './types';

/**
 * Turns whatever the User typed into an absolute Path. `~` and the empty String
 * both mean Home; `..` at the Root stays at the Root, the way a real Shell does.
 */
export function resolvePath(cwd: string, input: string): string {
	const raw = input.trim();
	const start = raw === '' || raw === '~' || raw.startsWith('~/') || raw.startsWith('/') ? '' : cwd;
	const rest = raw.replace(/^~\/?/, '').replace(/^\//, '');

	const segments = start.split('/').filter(Boolean);
	for (const segment of rest.split('/')) {
		if (segment === '' || segment === '.') continue;
		if (segment === '..') segments.pop();
		else segments.push(segment);
	}

	return segments.length ? `/${segments.join('/')}` : '';
}

export function lookup(vfs: VirtualFileSystem, path: string): VfsNode | undefined {
	if (path === '') return vfs.root;

	let node: VfsNode = vfs.root;
	for (const segment of path.split('/').filter(Boolean)) {
		if (node.kind !== 'dir') return undefined;
		const next = node.children.get(segment);
		if (!next) return undefined;
		node = next;
	}
	return node;
}

export function listDir(dir: DirNode): VfsNode[] {
	return sortEntries([...dir.children.values()].filter((node) => !hidden.includes(node.path)));
}

/** `~` for Home, otherwise the Path as typed — what the Prompt and Status Bar show. */
export function displayPath(path: string): string {
	return path === '' ? '~' : `~${path}`;
}
