import { applyTheme, type ThemeName } from '../themes/applyTheme';
import {
	agentStatus,
	currentDirectory,
	questionsLeft,
	themeName,
	type AgentStatus
} from './stores';

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

export function setAgentStatus(status: AgentStatus): void {
	agentStatus.set(status);
}

export function setQuestionsLeft(remaining: number): void {
	questionsLeft.set(Math.max(0, remaining));
}

