import themes from './themes.json';

export type ThemeName = keyof typeof themes;

export const themeNames = Object.keys(themes) as ThemeName[];

export const isThemeName = (value: string): value is ThemeName => value in themes;

export const getTheme = (name: ThemeName) => themes[name];

/**
 * xterm owns the Terminal Surface; the Svelte Chrome around It reads these
 * Variables. One Call keeps Both in Step.
 */
export function applyTheme(name: ThemeName): void {
	const theme = themes[name];
	const root = document.documentElement;
	root.style.setProperty('--term-bg', theme.xterm.background);
	root.style.setProperty('--term-fg', theme.xterm.foreground);
	root.style.setProperty('--term-dim', theme.xterm.brightBlack);
	root.style.setProperty('--term-accent', theme.xterm.yellow);
	root.style.setProperty('--term-alt', theme.xterm.cyan);
	root.style.setProperty('--term-warn', theme.xterm.magenta);
	root.style.setProperty('--chrome-bar', theme.chrome.bar);
	root.style.setProperty('--chrome-line', theme.chrome.line);
	root.style.setProperty('--page-bg', theme.chrome.page);
	root.dataset.theme = name;
}
