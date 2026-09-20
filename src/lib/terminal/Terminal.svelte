<script lang="ts">
	import type { Terminal as XTerm } from '@xterm/xterm';
	import { onMount } from 'svelte';
	import { History } from '../commands/history';
	import { run } from '../commands/router';
	import type { TerminalWriter } from '../commands/types';
	import { markTerminalReady, setDirectory, setTheme, storedTheme } from '../state/actions';
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
			markTerminalReady();
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
			terminal.write(`[2K\r${promptText()}${line}`);
			if (cursor < line.length) terminal.write(`[${line.length - cursor}D`);
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
				if (data === '' || data === '') controller?.abort();
				return;
			}

			switch (data) {
				case '\r':
					void submit();
					return;
				case '':
					if (cursor > 0) {
						line = line.slice(0, cursor - 1) + line.slice(cursor);
						cursor -= 1;
						redraw();
					}
					return;
				case '[A':
					setLine(history.previous() ?? line);
					return;
				case '[B':
					setLine(history.next() ?? '');
					return;
				case '[D':
					if (cursor > 0) {
						cursor -= 1;
						terminal.write('[D');
					}
					return;
				case '[C':
					if (cursor < line.length) {
						cursor += 1;
						terminal.write('[C');
					}
					return;
				case '[H':
				case '':
					cursor = 0;
					redraw();
					return;
				case '[F':
				case '':
					cursor = line.length;
					redraw();
					return;
				case '':
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
				case '':
					terminal.clear();
					redraw();
					return;
			}

			if (data >= ' ' && data !== '') {
				line = line.slice(0, cursor) + data + line.slice(cursor);
				cursor += data.length;
				redraw();
			}
		});
	}
</script>

<div class="frame">
	<div class="chrome">
		<span class="dot" style="background: var(--term-warn)"></span>
		<span class="dot" style="background: var(--term-accent)"></span>
		<span class="dot" style="background: var(--term-alt)"></span>
		<span class="title">rv — arvin.dev</span>
	</div>

	<div class="stage">
		{#if !booted}
			<Banner />
		{/if}
		<div class="term" class:hidden={!booted} bind:this={host}></div>
	</div>
</div>

<style>
	.frame {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--term-bg);
		border-radius: 10px;
		overflow: hidden;
	}
	.chrome {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: var(--chrome-bar);
		border-bottom: 1px solid var(--chrome-line);
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.title {
		margin-left: 6px;
		color: var(--term-dim);
		font-size: 0.86em;
	}
	.stage {
		flex: 1;
		min-height: 0;
		position: relative;
	}
	.term {
		height: 100%;
		padding: 10px 12px 0;
	}
	.hidden {
		visibility: hidden;
		position: absolute;
		inset: 0;
	}
</style>
