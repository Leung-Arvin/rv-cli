import { isAllowed } from './links';

const escapeHtml = (text: string) =>
	text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

/**
 * Escapes first, formats second. Content is Ours, but the Agent's Output runs
 * through here too, so this never trusts its Input.
 */
export function markdownToHtml(source: string): string {
	return escapeHtml(source)
		.split(/\r?\n\r?\n/)
		.map((block) => {
			const heading = /^(#{1,6})\s+(.*)$/.exec(block.trim());
			if (heading) return `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;

			if (/^\s*[-*]\s+/m.test(block)) {
				const items = block
					.split(/\r?\n/)
					.filter((line) => /^\s*[-*]\s+/.test(line))
					.map((line) => `<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
					.join('');
				return `<ul>${items}</ul>`;
			}

			return `<p>${inline(block.replace(/\r?\n/g, ' '))}</p>`;
		})
		.join('');
}

function inline(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (whole, label, url) =>
			isAllowed(url)
				? `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
				: whole
		)
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
