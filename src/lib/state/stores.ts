import { derived, writable } from 'svelte/store';
import type { ThemeName } from '../themes/applyTheme';
import { displayPath } from '../vfs/navigator';

export const currentDirectory = writable('');
export const themeName = writable<ThemeName>('carbon');

export const promptPath = derived(currentDirectory, displayPath);
