import type { Terminal } from '@xterm/xterm';
import type { TerminalWriter } from '../commands/types';
import { c } from './ansi';

/** xterm wants CRLF. Handlers should not have to remember that. */
const crlf = (text: string) => text.replace(/\r?\n/g, '\r\n');

export function createWriter(terminal: Terminal): TerminalWriter {
	return {
		write: (text) => terminal.write(crlf(text)),
		writeLine: (text) => terminal.write(`${crlf(text)}\r\n`),
		writeError: (text) => terminal.write(`${c.error(crlf(text))}\r\n`),
		clear: () => terminal.clear()
	};
}
