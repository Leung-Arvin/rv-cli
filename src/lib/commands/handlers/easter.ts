import { c } from '../../terminal/ansi';
import { ok, type CommandHandler } from '../types';

/**
 * The Commands nobody documents are the Ones Visitors actually try. They are the
 * cheapest Place to have a Personality, so none of Them get a blank Stare.
 */
function joke(name: string, lines: string[]): CommandHandler {
	return {
		name,
		description: '',
		hidden: true,
		async execute(_ctx, term) {
			for (const line of lines) term.writeLine(line);
			return ok();
		}
	};
}

export const easterEggs: CommandHandler[] = [
	joke('sudo', [
		c.error('Nice Try.'),
		c.dim('You are not in the Sudoers File. This Incident has been reported'),
		c.dim('to absolutely Nobody.')
	]),
	joke('rm', [c.error('No.'), c.dim('I have exactly One Copy of this and You are a Stranger.')]),
	joke('vim', [c.error('No.'), c.dim('Use `cat`. We both know how this ends.')]),
	joke('emacs', [c.dim('Now You are just trying to start Something.')]),
	joke('whoami', [
		c.dim('A Guest, which is the best Kind of Person to be at a Party.'),
		c.dim('If You want to know who I am, try `cat About.md`.')
	]),
	joke('exit', [
		c.dim('This is a Browser Tab. You have all the Power here.'),
		c.dim('But thanks for knocking on the Way out.')
	]),
	joke('man', [c.dim('No Manual. Just Me. Try `help`.')])
];
