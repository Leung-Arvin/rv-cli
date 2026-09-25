import { applyTheme, type ThemeName } from '../themes/applyTheme';
import { currentDirectory, themeName } from './stores';

const THEME_KEY = 'rv:theme';

export function setDirectory(path: string): void {
	currentDirectory.set(path);
}

export function setTheme(name: ThemeName): void {
	themeName.set(name);
	applyTheme(name);
	try {
		localStorage.setItem(THEME_KEY, name);
	} catch {
		// Private Windows and blocked Storage are fine. The Theme just will not stick.
	}
}

export function storedTheme(): string | null {
	try {
		return localStorage.getItem(THEME_KEY);
	} catch {
		return null;
	}
}
