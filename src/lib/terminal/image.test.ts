import { describe, expect, it } from 'vitest';
import { buildVfs } from '../vfs/build';
import { resolveImage } from './image';
import { renderMarkdown } from './markdown';

const vfs = buildVfs(
	{ '/content/Projects/rv-cli.md': '![A Shot](rv-cli.png)' },
	{
		'/content/Projects/rv-cli.png': '/assets/rv-cli.png',
		'/content/Shared/wide.png': '/assets/wide.png'
	}
);

describe('Images in the Filesystem', () => {
	it('become Files You can list and cat', () => {
		const node = vfs.root.children.get('Projects');
		expect(node?.kind).toBe('dir');
		if (node?.kind !== 'dir') return;

		const image = node.children.get('rv-cli.png');
		expect(image?.kind).toBe('file');
		if (image?.kind !== 'file') return;

		expect(image.url).toBe('/assets/rv-cli.png');
		expect(image.mediaType).toBe('image/png');
	});
});

describe('resolveImage', () => {
	it('resolves relative to the File doing the referencing', () => {
		expect(resolveImage(vfs, '/Projects/rv-cli.md', 'rv-cli.png')).toBe('/assets/rv-cli.png');
	});

	it('walks up and across', () => {
		expect(resolveImage(vfs, '/Projects/rv-cli.md', '../Shared/wide.png')).toBe('/assets/wide.png');
	});

	it('returns nothing for a Reference that points nowhere', () => {
		expect(resolveImage(vfs, '/Projects/rv-cli.md', 'missing.png')).toBeUndefined();
	});
});

describe('renderMarkdown', () => {
	it('turns a standalone Image into a Token the Caller can draw', () => {
		expect(renderMarkdown('![A Shot](rv-cli.png)')).toEqual([
			{ kind: 'image', alt: 'A Shot', src: 'rv-cli.png' }
		]);
	});

	it('leaves an Image mentioned mid-Sentence as Text', () => {
		const tokens = renderMarkdown('See ![A Shot](rv-cli.png) here');
		expect(tokens).toHaveLength(1);
		expect(tokens[0].kind).toBe('line');
	});
});
