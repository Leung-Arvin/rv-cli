import { socials as socialLinks } from '../../../../content.config';
import { bold, c, padEnd } from '../../terminal/ansi';
import { isThemeName, themeNames } from '../../themes/applyTheme';
import { fail, ok, type CommandHandler } from '../types';
import { commands } from './index';

export const help: CommandHandler = {
	name: 'help',
	description: 'This List',
	async execute(_ctx, term) {
		const visible = commands.filter((command) => !command.hidden);
		const width = Math.max(...visible.map((command) => command.name.length)) + 6;

		term.writeLine('');
		for (const command of visible) {
			term.writeLine(padEnd(c.prompt(command.name), width) + c.dim(command.description));
		}
		term.writeLine('');
		term.writeLine(c.dim('Arrow Keys walk Your History. Tab is not wired up yet, sorry.'));
		term.writeLine('');
		return ok();
	}
};

export const clear: CommandHandler = {
	name: 'clear',
	description: 'Wipe the Screen',
	async execute(_ctx, term) {
		term.clear();
		return ok();
	}
};

export const theme: CommandHandler = {
	name: 'theme',
	description: `Change the Colors (${themeNames.join(', ')})`,
	async execute(ctx, term) {
		const requested = ctx.args[0];

		if (!requested) {
			term.writeLine(c.dim(`Pick One: ${themeNames.join(', ')}`));
			return ok();
		}
		if (!isThemeName(requested)) {
			term.writeError(`theme: ${requested} is not One of Mine. Try ${themeNames.join(', ')}.`);
			return fail();
		}
		return ok({ newTheme: requested });
	}
};

export const socials: CommandHandler = {
	name: 'socials',
	description: 'Where else to find Me',
	async execute(_ctx, term) {
		const width = Math.max(...socialLinks.map((link) => link.label.length)) + 4;
		term.writeLine('');
		for (const link of socialLinks) {
			const shown = link.url.replace(/^https?:\/\//, '').replace(/^mailto:/, '');
			term.writeLine('  ' + padEnd(bold(link.label), width) + c.link(shown));
		}
		term.writeLine('');
		return ok();
	}
};
