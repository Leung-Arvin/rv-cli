import { c } from './ansi';

export const wordmark = ['┬─┐ ┬  ┬', '├┬┘ └┐┌┘', '┴└─  └┘ '];

export const owner = 'Arvin Leung';
export const tagline = 'Software Engineer · Ottawa';

/** Edit this One Line and the Site looks alive again. */
export const nowLine = [
	'teaching a Terminal to talk back. Over-engineering It,',
	"obviously. That's the Point."
];

const VISIT_KEY = 'rv:last-visit';

/**
 * The real Date of Your last Visit, or a Welcome if this is the First. A true
 * Detail beats an invented Visitor Counter.
 */
export function lastVisitLine(): string {
	let previous: string | null = null;
	try {
		previous = localStorage.getItem(VISIT_KEY);
		localStorage.setItem(VISIT_KEY, new Date().toISOString());
	} catch {
		// No Storage, no Greeting. Not worth failing over.
	}

	if (!previous) return 'First Time here. Make Yourself at Home.';

	const when = new Date(previous);
	if (Number.isNaN(when.getTime())) return 'First Time here. Make Yourself at Home.';

	return `Last Login: ${when.toLocaleString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})}`;
}

/** The same Banner the HTML Shell showed, so nothing is lost to the Scrollback. */
export function bannerLines(): string[] {
	return [
		'',
		`  ${c.prompt(wordmark[0])}`,
		`  ${c.prompt(wordmark[1])}   ${owner}`,
		`  ${c.prompt(wordmark[2])}   ${c.dim(tagline)}`,
		'',
		`  ${c.dim(lastVisitLine())}`,
		'',
		`  ${c.dir('Now:')} ${nowLine[0]}`,
		`       ${nowLine[1]}`,
		'',
		`  Type ${c.prompt('help')} for Commands. Type ${c.prompt('ama <Question>')} to ask My Agent`,
		'  something It will answer with more Confidence than Accuracy.',
		''
	];
}
