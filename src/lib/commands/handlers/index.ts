import type { CommandHandler } from '../types';
import { ama, feedback } from './agent';
import { easterEggs } from './easter';
import { cat, cd, ls, pwd } from './filesystem';
import { clear, help, socials, theme } from './shell';

export const commands: CommandHandler[] = [
	ls,
	cd,
	pwd,
	cat,
	ama,
	{ ...ama, name: 'ask', hidden: true },
	feedback,
	socials,
	theme,
	clear,
	help,
	...easterEggs
];

export const commandMap = new Map(commands.map((command) => [command.name, command]));
