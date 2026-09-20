<script lang="ts">
	import type { Terminal as XTerm } from '@xterm/xterm';
	import { onMount } from 'svelte';
	import { columnize, complete } from '../commands/complete';
	import { History } from '../commands/history';
	import { run } from '../commands/router';
	import type { TerminalWriter } from '../commands/types';
	import { setDirectory, setTheme, storedTheme } from '../state/actions';
	import { currentDirectory } from '../state/stores';
	import { getTheme, isThemeName, type ThemeName } from '../themes/applyTheme';
	import { displayPath } from '../vfs/navigator';
	import type { VirtualFileSystem } from '../vfs/types';
	import { c } from './ansi';
	import Banner from './Banner.svelte';
	import { bannerLines } from './banner';
	import { openIfAllowed } from './links';
	import { createWriter } from './TerminalWriter';

	let { vfs }: { vfs: VirtualFileSystem } = $props();

	let host: HTMLDivElement;
	let booted = $state(false);

	let cwd = '';
	currentDirectory.subscribe((value) => (cwd = value));

	onMount(() => {
		let terminal: XTerm | undefined;
		let disposed = false;
		let observer: ResizeObserver | undefined;

		const boot = async () => {
			const [{ Terminal }, { FitAddon }, { WebLinksAddon }] = await Promise.all([
				import('@xterm/xterm'),
				import('@xterm/addon-fit'),
				import('@xterm/addon-web-links'),
				import('@xterm/xterm/css/xterm.css')
			]);
			if (disposed) return;

			const stored = storedTheme();
			const initial: ThemeName = stored && isThemeName(stored) ? stored : 'carbon';
			setTheme(initial);

			terminal = new Terminal({
				theme: getTheme(initial).xterm,
				fontFamily:
					"ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, Consolas, 'Liberation Mono', monospace",
				fontSize: 13.5,
				lineHeight: 1.45,
				cursorBlink: true,
				cursorStyle: 'block',
				scrollback: 2000,
				screenReaderMode: true,
				allowProposedApi: true
			});

			const fit = new FitAddon();
			terminal.loadAddon(fit);
			terminal.loadAddon(new WebLinksAddon((_event, uri) => openIfAllowed(uri)));

			terminal.open(host);
			fit.fit();
			booted = true;
			terminal.focus();

			observer = new ResizeObserver(() => fit.fit());
			observer.observe(host);

			wire(terminal, createWriter(terminal));
		};

		boot();

		return () => {
			disposed = true;
			observer?.disconnect();
			terminal?.dispose();
		};
	});

	function wire(terminal: XTerm, writer: TerminalWriter) {
		const history = new History();
		let line = '';
		let cursor = 0;
		let busy = false;
		let controller: AbortController | null = null;

		const promptText = () =>
			`${c.prompt('Guest@rv')}${c.dim(':')}${c.dir(displayPath(cwd))}${c.dim('$')} `;

		const redraw = () => {
			terminal.write(`\x1b[2K\r${promptText()}${line}`);
			if (cursor < line.length) terminal.write(`\x1b[${line.length - cursor}D`);
		};

		const setLine = (next: string) => {
			line = next;
			cursor = next.length;
			redraw();
		};

		for (const bannerLine of bannerLines()) writer.writeLine(bannerLine);
		terminal.write(promptText());

		const submit = async () => {
			const input = line;
			terminal.write('\r\n');
			history.push(input);
			line = '';
			cursor = 0;

			if (input.trim()) {
				busy = true;
				controller = new AbortController();
				const result = await run(input, { currentDirectory: cwd, vfs }, writer, controller.signal);
				busy = false;
				controller = null;

				if (result.newDirectory !== undefined) setDirectory(result.newDirectory);
				if (result.newTheme) {
					setTheme(result.newTheme);
					terminal.options.theme = getTheme(result.newTheme).xterm;
				}
			}
			terminal.write(promptText());
		};

		terminal.onData((data) => {
			if (busy) {
				// Only Interrupts get through while a Command owns the Line.
				if (data === '\x03' || data === '\x1b') controller?.abort();
				return;
			}

			switch (data) {
				case '\r':
					void submit();
					return;
				case '\t': {
					const filled = complete(line, cursor, { currentDirectory: cwd, vfs });
					line = filled.line;
					cursor = filled.cursor;

					if (filled.candidates.length > 1) {
						terminal.write('\r\n');
						const painted = filled.candidates.map((name) =>
							name.endsWith('/') ? c.dir(name) : c.file(name)
						);
						for (const row of columnize(painted, terminal.cols)) writer.writeLine(row);
					}
					redraw();
					return;
				}
				case '\x7f':
					if (cursor > 0) {
						line = line.slice(0, cursor - 1) + line.slice(cursor);
						cursor -= 1;
						redraw();
					}
					return;
				case '\x1b[A':
					setLine(history.previous() ?? line);
					return;
				case '\x1b[B':
					setLine(history.next() ?? '');
					return;
				case '\x1b[D':
					if (cursor > 0) {
						cursor -= 1;
						terminal.write('\x1b[D');
					}
					return;
				case '\x1b[C':
					if (cursor < line.length) {
						cursor += 1;
						terminal.write('\x1b[C');
					}
					return;
				case '\x1b[H':
				case '\x01':
					cursor = 0;
					redraw();
					return;
				case '\x1b[F':
				case '\x05':
					cursor = line.length;
					redraw();
					return;
				case '\x03':
					// Ctrl+C copies when something is selected, and interrupts when nothing is.
					if (terminal.hasSelection()) {
						void navigator.clipboard?.writeText(terminal.getSelection());
						terminal.clearSelection();
						return;
					}
					terminal.write(`${c.dim('^C')}\r\n${promptText()}`);
					line = '';
					cursor = 0;
					return;
				case '\x0c':
					terminal.clear();
					redraw();
					return;
			}

			if (data >= ' ' && data !== '\x7f') {
				line = line.slice(0, cursor) + data + line.slice(cursor);
				cursor += data.length;
				redraw();
			}
		});
	}
</script>

<div class="stage">
	{#if !booted}
		<Banner />
	{/if}
	<div class="term" class:hidden={!booted} bind:this={host}></div>
</div>

<style>
	/* The Padding lives here so FitAddon measures the exact Box it gets to draw
	   in — on .term it made xterm round up and tuck the last Row under the Bar. */
	.stage {
		height: 100%;
		min-height: 0;
		position: relative;
		overflow: hidden;
		padding: 10px 12px 0;
		background: var(--term-bg);
	}
	.term {
		height: 100%;
	}
	.hidden {
		visibility: hidden;
		position: absolute;
		inset: 0;
	}
</style>
