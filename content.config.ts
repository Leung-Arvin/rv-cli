/**
 * Overrides for the generated Virtual Filesystem. Everything here is optional —
 * a new Markdown file in content/ shows up without being listed.
 */

/** One line shown beside each Entry when `ls` runs. This is the Copy that sells the Site. */
export const descriptions: Record<string, string> = {
	'/About.md': 'Who I am, in fewer Words than My Resume',
	'/Career': "Where I've Worked, and what I broke there",
	'/Projects': 'Things I finished. Mostly.',
	'/Blog': "Opinions I'll regret in two Years",
	'/Resume.md': 'The formal Version, for People with Forms',
	'/Contact.md': 'How to reach Me'
};

/** Entries listed first, in this Order. Anything unlisted sorts alphabetically after. */
export const order: string[] = ['Career', 'Projects', 'Blog', 'About.md', 'Resume.md', 'Contact.md'];

/** Paths `ls` will not show. They still resolve if You know the Name. */
export const hidden: string[] = [];

/** What `socials` prints. Only these Domains are ever made clickable. */
export const socials: { label: string; url: string }[] = [
	{ label: 'GitHub', url: 'https://github.com/Leung-Arvin' },
	{ label: 'LinkedIn', url: 'https://linkedin.com/in/arvin-leung' },
	{ label: 'Email', url: 'mailto:hi@arvin.dev' }
];

/** A Link in Content or Agent Output is clickable only if its Host is here. */
export const linkAllowlist: string[] = [
	'github.com',
	'www.github.com',
	'linkedin.com',
	'www.linkedin.com',
	'arvin.dev',
	'www.arvin.dev'
];
