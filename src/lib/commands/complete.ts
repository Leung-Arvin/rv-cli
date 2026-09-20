import { padEnd, visibleLength } from '../terminal/ansi';
import { listDir, lookup, resolvePath } from '../vfs/navigator';
import type { VirtualFileSystem } from '../vfs/types';
import { commands } from './handlers/index';

export interface Completion {
	line: string;
	cursor: number;
	/** Only populated when the Word is ambiguous and could not be extended. */
	candidates: string[];
}

interface CompleteState {
	currentDirectory: string;
	vfs: VirtualFileSystem;
}

function longestCommonPrefix(values: string[]): string {
	if (values.length === 0) return '';
	let prefix = values[0];
	for (const value of values.slice(1)) {
		let i = 0;
		while (i < prefix.length && i < value.length && prefix[i] === value[i]) i += 1;
		prefix = prefix.slice(0, i);
	}
	return prefix;
}

function commandCandidates(word: string): string[] {
	return commands
		.filter((command) => !command.hidden && command.name.startsWith(word))
		.map((command) => command.name);
}

function pathCandidates(word: string, state: CompleteState): string[] {
	const cut = word.lastIndexOf('/');
	const directoryPart = cut === -1 ? '' : word.slice(0, cut + 1);
	const base = cut === -1 ? word : word.slice(cut + 1);

	// An empty Directory Part means Here, not Home — the same Trap `ls` fell into.
	const target = directoryPart
		? resolvePath(state.currentDirectory, directoryPart)
		: state.currentDirectory;

	const node = lookup(state.vfs, target);
	if (!node || node.kind !== 'dir') return [];

	return listDir(node)
		.filter((entry) => entry.name.startsWith(base))
		.map((entry) => (entry.kind === 'dir' ? `${entry.name}/` : entry.name));
}

/**
 * Completes the Word under the Cursor: Command Names in the first Position,
 * Paths everywhere else. Extends as far as the Candidates agree, and only gives
 * up and lists Them when extending would change nothing.
 */
export function complete(line: string, cursor: number, state: CompleteState): Completion {
	const head = line.slice(0, cursor);
	const start = head.search(/\S*$/);
	const word = head.slice(start);
	const tail = line.slice(cursor);

	const isFirstWord = head.slice(0, start).trim() === '';
	const candidates = isFirstWord ? commandCandidates(word) : pathCandidates(word, state);

	if (candidates.length === 0) return { line, cursor, candidates: [] };

	const cut = word.lastIndexOf('/');
	const prefix = isFirstWord || cut === -1 ? '' : word.slice(0, cut + 1);
	const base = isFirstWord || cut === -1 ? word : word.slice(cut + 1);

	if (candidates.length === 1) {
		const only = candidates[0];
		// A Directory invites another Segment; anything else ends the Word.
		const completed = only.endsWith('/') ? only : `${only} `;
		const next = head.slice(0, start) + prefix + completed;
		return { line: next + tail, cursor: next.length, candidates: [] };
	}

	const shared = longestCommonPrefix(candidates);
	if (shared.length > base.length) {
		const next = head.slice(0, start) + prefix + shared;
		return { line: next + tail, cursor: next.length, candidates: [] };
	}

	return { line, cursor, candidates };
}

/**
 * Lays Candidates out the way a Shell does. Widths are measured with the ANSI
 * Codes ignored, so coloured Entries still line up.
 */
export function columnize(items: string[], width: number): string[] {
	if (items.length === 0) return [];

	const cell = Math.max(...items.map(visibleLength)) + 2;
	const perRow = Math.max(1, Math.floor(width / cell));
	const rows: string[] = [];

	for (let i = 0; i < items.length; i += perRow) {
		rows.push(
			items
				.slice(i, i + perRow)
				.map((item) => padEnd(item, cell))
				.join('')
				.trimEnd()
		);
	}
	return rows;
}
