import { setAgentStatus, setQuestionsLeft } from '../../state/actions';
import { c } from '../../terminal/ansi';
import { fail, ok, type CommandHandler, type TerminalWriter } from '../types';

const RAIL = () => `${c.agent('▌')} `;

/** Keeps the Gutter Rail in front of every Line the Model streams. */
function railed(term: TerminalWriter, chunk: string): void {
	term.write(chunk.replace(/\n/g, `\r\n${RAIL()}`));
}

export const ama: CommandHandler = {
	name: 'ama',
	description: 'Ask My Agent about Me',
	async execute(ctx, term, signal) {
		const question = ctx.args.join(' ').trim();
		if (!question) {
			term.writeError('ama: ask Me something — `ama what do You actually build?`');
			return fail();
		}

		term.writeLine('');
		term.writeLine(`${RAIL()}${c.dim('rv-bot · llama-3.1-8b · not Arvin, and will say so')}`);
		term.write(RAIL());
		setAgentStatus('thinking');

		try {
			const response = await fetch('/api/ama', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ question }),
				signal
			});

			const remaining = response.headers.get('x-ratelimit-remaining');
			if (remaining !== null) setQuestionsLeft(Number(remaining));

			if (response.status === 429) {
				term.write('\r\n');
				term.writeError('Slow down — You have used up Your Questions for now.');
				term.writeLine(c.dim('The Limit resets in a Minute. The Files are still free.'));
				setAgentStatus('idle');
				return fail();
			}

			if (!response.ok || !response.body) {
				throw new Error(`ama responded ${response.status}`);
			}

			setAgentStatus('streaming');
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) railed(term, value);
			}

			term.write('\r\n');
			term.writeLine(c.dim('`feedback <Correction>` if I got that wrong.'));
			term.writeLine('');
			setAgentStatus('idle');
			return ok();
		} catch (error) {
			if (signal.aborted) {
				term.write('\r\n');
				term.writeLine(c.dim('stopped.'));
				term.writeLine('');
				setAgentStatus('idle');
				return ok();
			}

			term.write('\r\n');
			term.writeError('My Agent is not answering right now.');
			term.writeLine(c.dim('The Filesystem does not need Him though — try `ls` or `cat About.md`.'));
			setAgentStatus('unreachable');
			return fail();
		}
	}
};

export const feedback: CommandHandler = {
	name: 'feedback',
	description: 'Tell Me the Agent got something wrong',
	async execute(ctx, term, signal) {
		const correction = ctx.args.join(' ').trim();
		if (!correction) {
			term.writeError('feedback: what did He get wrong? `feedback He never worked at Google`');
			return fail();
		}

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ correction }),
				signal
			});
			if (!response.ok) throw new Error(`feedback responded ${response.status}`);

			term.writeLine(c.ok('Logged.') + c.dim(' I read these. Thank You for bothering.'));
			return ok();
		} catch {
			term.writeError('Could not send that. The Irony is not lost on Me.');
			return fail();
		}
	}
};
