import { bold, c } from './ansi';

export type MarkdownToken =
	| { kind: 'line'; text: string }
	| { kind: 'image'; src: string; alt: string };

const STANDALONE_IMAGE = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/;

/**
 * Just enough Markdown to read a Post in a Terminal. Not a Parser — a Reader.
 * An Image on its own Line becomes a Token the Caller can draw; anything else
 * is Text that is ready to write.
 */
export function renderMarkdown(source: string): MarkdownToken[] {
	const tokens: MarkdownToken[] = [];
	const line = (text: string) => tokens.push({ kind: 'line', text });

	for (const raw of source.split(/\r?\n/)) {
		const image = STANDALONE_IMAGE.exec(raw);
		if (image) {
			tokens.push({ kind: 'image', alt: image[1], src: image[2] });
			continue;
		}

		const heading = /^(#{1,6})\s+(.*)$/.exec(raw);
		if (heading) {
			line(bold(c.dir(heading[2])));
			continue;
		}

		if (/^\s*[-*]\s+/.test(raw)) {
			line(raw.replace(/^(\s*)[-*]\s+/, (_, indent) => `${indent}  ${c.dir('·')} `));
			continue;
		}

		if (/^\s*>/.test(raw)) {
			line(c.dim(raw.replace(/^\s*>\s?/, '  │ ')));
			continue;
		}

		if (/^\s*(---|===)\s*$/.test(raw)) {
			line(c.dim('─'.repeat(40)));
			continue;
		}

		line(inline(raw));
	}

	return tokens;
}

function inline(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `${label} ${c.link(`<${url}>`)}`)
		.replace(/`([^`]+)`/g, (_, code) => c.prompt(code))
		.replace(/\*\*([^*]+)\*\*/g, (_, strong) => bold(strong));
}
