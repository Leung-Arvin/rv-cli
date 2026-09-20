/**
 * Every Color goes through a standard ANSI Slot rather than a literal Hex, so a
 * new Theme is a new JSON Object in themes.json and nothing else changes.
 */
const wrap = (code: number) => (text: string) => `\x1b[${code}m${text}\x1b[0m`;

export const c = {
	prompt: wrap(33),
	dir: wrap(36),
	file: wrap(37),
	dim: wrap(90),
	link: wrap(34),
	agent: wrap(35),
	error: wrap(31),
	ok: wrap(32)
};

export const bold = (text: string) => `\x1b[1m${text}\x1b[22m`;

/** Visible Width, ignoring Escape Sequences — needed to line up Columns. */
export function visibleLength(text: string): number {
	return text.replace(/\x1b\[[0-9;]*m/g, '').length;
}

export function padEnd(text: string, width: number): string {
	return text + ' '.repeat(Math.max(0, width - visibleLength(text)));
}
