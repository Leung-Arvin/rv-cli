import { bold, c } from './ansi';

/**
 * Just enough Markdown to read a Post in a Terminal. Not a Parser — a Reader.
 */
export function renderMarkdown(source: string): string[] {
	const lines: string[] = [];

	for (const raw of source.split(/\r?\n/)) {
		const heading = /^(#{1,6})\s+(.*)$/.exec(raw);
		if (heading) {
			lines.push(bold(c.dir(heading[2])));
			continue;
		}

		if (/^\s*[-*]\s+/.test(raw)) {
			lines.push(raw.replace(/^(\s*)[-*]\s+/, (_, indent) => `${indent}  ${c.dir('·')} `));
			continue;
		}

		if (/^\s*>/.test(raw)) {
			lines.push(c.dim(raw.replace(/^\s*>\s?/, '  │ ')));
			continue;
		}

		if (/^\s*(---|===)\s*$/.test(raw)) {
			lines.push(c.dim('─'.repeat(40)));
			continue;
		}

		lines.push(inline(raw));
	}

	return lines;
}

function inline(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => `${label} ${c.link(`<${url}>`)}`)
		.replace(/`([^`]+)`/g, (_, code) => c.prompt(code))
		.replace(/\*\*([^*]+)\*\*/g, (_, strong) => bold(strong));
}
