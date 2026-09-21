import { c } from './ansi';

export const wordmark = ['┬─┐ ┬  ┬', '├┬┘ └┐┌┘', '┴└─  └┘ '];

export const owner = 'Arvin Leung';
export const tagline = 'Software Engineer · Ottawa';
export const release = 'rv 1.0.0';

/** Edit this One Line and the Site looks alive again. */
export const nowLine = 'teaching a Terminal to talk back. Over-engineering It, obviously.';

const VISIT_KEY = 'rv:last-visit';
const TTY_KEY = 'rv:tty';

/** A stable Fake tty per Visitor, the way a real Login prints One. */
export function tty(): string {
	let name: string | null = null;
	try {
		name = sessionStorage.getItem(TTY_KEY);
		if (!name) {
			name = `ttys${String(Math.floor(Math.random() * 900) + 100)}`;
			sessionStorage.setItem(TTY_KEY, name);
		}
	} catch {
		name = 'ttys000';
	}
	return name;
}

/**
 * The first Line a real Shell prints. Uses the genuine Date of Your last Visit,
 * because an invented one would be the only false Thing on the Screen.
 */
export function loginLine(): string {
	let previous: string | null = null;
	try {
		previous = localStorage.getItem(VISIT_KEY);
		localStorage.setItem(VISIT_KEY, new Date().toISOString());
	} catch {
		// No Storage, no Greeting.
	}

	const when = previous ? new Date(previous) : null;
	if (!when || Number.isNaN(when.getTime())) return `First login on ${tty()}`;

	const stamp = when.toLocaleString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
	return `Last login: ${stamp} on ${tty()}`;
}

export const motdEntries: [string, string][] = [
	['Contents', 'ls'],
	['Ask Me', 'ama <Question>'],
	['Everything else', 'help']
];

/** The motd, written into the Terminal so nothing is lost to the Scrollback. */
export function bannerLines(): string[] {
	const pad = Math.max(...motdEntries.map(([label]) => label.length));

	return [
		c.dim(loginLine()),
		'',
		` ${c.prompt(wordmark[0])}   ${release} — ${owner}`,
		` ${c.prompt(wordmark[1])}   ${c.dim(tagline)}`,
		` ${c.prompt(wordmark[2])}`,
		'',
		...motdEntries.map(
			([label, command]) =>
				` ${c.dim('*')} ${label}:${' '.repeat(pad - label.length)}   ${c.prompt(command)}`
		),
		'',
		` ${c.dir('Now:')} ${nowLine}`,
		''
	];
}
