import type { ThemeName } from '../themes/applyTheme';
import type { VirtualFileSystem } from '../vfs/types';

export interface CommandContext {
	currentDirectory: string;
	vfs: VirtualFileSystem;
	args: string[];
}

/**
 * Handlers write Output through this rather than returning one big String, so a
 * streaming Command like `ama` uses the same Interface as `ls`.
 */
export interface TerminalWriter {
	write(text: string): void;
	writeLine(text: string): void;
	writeError(text: string): void;
	clear(): void;
}

export interface CommandResult {
	exitCode: number;
	newDirectory?: string;
	newTheme?: ThemeName;
}

export interface CommandHandler {
	name: string;
	description: string;
	hidden?: boolean;
	execute(ctx: CommandContext, term: TerminalWriter, signal: AbortSignal): Promise<CommandResult>;
}

export const ok = (extra: Partial<CommandResult> = {}): CommandResult => ({ exitCode: 0, ...extra });
export const fail = (): CommandResult => ({ exitCode: 1 });
