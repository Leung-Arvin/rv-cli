import { derived, writable } from 'svelte/store';
import type { ThemeName } from '../themes/applyTheme';
import { displayPath } from '../vfs/navigator';

export type AgentStatus = 'idle' | 'thinking' | 'streaming' | 'unreachable';

export const currentDirectory = writable('');
export const themeName = writable<ThemeName>('carbon');
export const agentStatus = writable<AgentStatus>('idle');
export const questionsLeft = writable(10);

export const promptPath = derived(currentDirectory, displayPath);
