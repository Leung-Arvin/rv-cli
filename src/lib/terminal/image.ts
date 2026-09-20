import { lookup, resolvePath } from '../vfs/navigator';
import type { VirtualFileSystem } from '../vfs/types';

/**
 * Resolves an Image Reference written inside a Markdown File, relative to that
 * File, and hands back the built Asset URL. Returns nothing if the Reference
 * points at something that is not an Image in the Filesystem.
 */
export function resolveImage(
	vfs: VirtualFileSystem,
	fromFilePath: string,
	src: string
): string | undefined {
	const directory = fromFilePath.slice(0, fromFilePath.lastIndexOf('/'));
	const node = lookup(vfs, resolvePath(directory, src));
	return node?.kind === 'file' ? node.url : undefined;
}

function toBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary);
}

/**
 * Builds an iTerm inline-image Sequence. Real Terminals — iTerm2, kitty,
 * wezterm — draw Images with exactly this, and xterm's Image Addon understands
 * It, so a Screenshot lands in the Scrollback rather than in a Lightbox.
 */
export async function inlineImage(url: string, widthInCells: number): Promise<string> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`image responded ${response.status}`);

	const bytes = new Uint8Array(await response.arrayBuffer());
	const args = `inline=1;width=${widthInCells};preserveAspectRatio=1;size=${bytes.length}`;
	return `\x1b]1337;File=${args}:${toBase64(bytes)}\x07`;
}
