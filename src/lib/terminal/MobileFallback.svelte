<script lang="ts">
	import { socials } from '../../../content.config';
	import { setAgentStatus } from '../state/actions';
	import { listDir } from '../vfs/navigator';
	import type { DirNode, VfsNode, VirtualFileSystem } from '../vfs/types';
	import { owner, tagline } from './banner';
	import { resolveImage } from './image';
	import { markdownToHtml } from './markdownHtml';

	let { vfs }: { vfs: VirtualFileSystem } = $props();

	let trail = $state<DirNode[]>([]);
	let open = $state<VfsNode | null>(null);

	const here = $derived(trail.at(-1) ?? vfs.root);
	const entries = $derived(listDir(here));

	function select(node: VfsNode) {
		if (node.kind === 'dir') {
			trail = [...trail, node];
			open = null;
		} else {
			open = node;
		}
	}

	function back() {
		if (open) open = null;
		else if (trail.length > 0) trail = trail.slice(0, -1);
	}

	let question = $state('');
	let answer = $state('');
	let asking = $state(false);

	async function ask(event: SubmitEvent) {
		event.preventDefault();
		const asked = question.trim();
		if (!asked || asking) return;

		asking = true;
		answer = '';
		setAgentStatus('thinking');

		try {
			const response = await fetch('/api/ama', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ question: asked })
			});
			if (response.status === 429) {
				answer = 'You have used up Your Questions for now. The Files are still free.';
				setAgentStatus('idle');
				return;
			}
			if (!response.ok || !response.body) throw new Error(`ama responded ${response.status}`);

			setAgentStatus('streaming');
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				if (value) answer += value;
			}
			setAgentStatus('idle');
		} catch {
			answer = 'My Agent is not answering right now. Everything else here still works.';
			setAgentStatus('unreachable');
		} finally {
			asking = false;
		}
	}
</script>

<div class="shell">
	<header>
		<span class="name">rv · {owner}</span>
		<span class="dim">{tagline}</span>
	</header>

	{#if trail.length > 0 || open}
		<button class="back" onclick={back}>← {open ? open.name : here.name}</button>
	{/if}

	{#if open && open.kind === 'file'}
		{@const file = open}
		<article>
			{#if file.url}
				<img src={file.url} alt={file.name} />
			{:else}
				{@html markdownToHtml(file.text, (src) => resolveImage(vfs, file.path, src))}
			{/if}
		</article>
	{:else}
		{#each entries as entry (entry.path)}
			<button class="row" onclick={() => select(entry)}>
				<span>
					{entry.name}
					{#if entry.description}<span class="dim note">{entry.description}</span>{/if}
				</span>
				<span class="dim">{entry.kind === 'dir' ? '›' : '·'}</span>
			</button>
		{/each}

		{#if trail.length === 0}
			<form class="ask" onsubmit={ask}>
				<input
					bind:value={question}
					placeholder="Ask Me anything…"
					aria-label="Ask the Agent a Question"
					maxlength="500"
				/>
				<button type="submit" disabled={asking} aria-label="Send">↑</button>
			</form>

			{#if answer}
				<p class="answer">{answer}</p>
			{:else if asking}
				<p class="answer dim">thinking…</p>
			{/if}

			<div class="socials">
				{#each socials as link (link.url)}
					<a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
				{/each}
			</div>
		{/if}
	{/if}

	<p class="foot">The full Terminal is waiting on a bigger Screen.</p>
</div>

<style>
	.shell {
		padding: 14px;
		color: var(--term-fg);
	}
	header {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 4px 4px 14px;
	}
	.name {
		color: var(--term-accent);
	}
	.dim {
		color: var(--term-dim);
	}
	.note {
		display: block;
		font-size: 0.82em;
		margin-top: 3px;
	}
	.row,
	.back {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		font: inherit;
		color: inherit;
		background: var(--chrome-bar);
		border: 1px solid var(--chrome-line);
		border-radius: 8px;
		padding: 13px;
		margin-bottom: 8px;
		cursor: pointer;
	}
	.back {
		background: none;
		border: none;
		color: var(--term-dim);
		padding: 4px;
	}
	article {
		line-height: 1.7;
	}
	article :global(h1),
	article :global(h2),
	article :global(h3) {
		color: var(--term-alt);
		font-size: 1.05em;
	}
	article :global(a) {
		color: var(--term-alt);
	}
	article img,
	article :global(img) {
		display: block;
		width: 100%;
		border: 1px solid var(--chrome-line);
		border-radius: 6px;
		margin: 12px 0;
	}
	article :global(.missing) {
		color: var(--term-dim);
	}
	.ask {
		display: flex;
		gap: 8px;
		margin: 11px 0 8px;
	}
	.ask input {
		flex: 1;
		min-width: 0;
		font: inherit;
		color: var(--term-fg);
		background: var(--chrome-bar);
		border: 1px solid var(--term-accent);
		border-radius: 8px;
		padding: 12px 13px;
	}
	.ask button {
		color: var(--term-accent);
		background: var(--chrome-bar);
		border: 1px solid var(--term-accent);
		border-radius: 8px;
		padding: 0 15px;
		cursor: pointer;
	}
	.ask button:disabled {
		opacity: 0.5;
	}
	.answer {
		border-left: 2px solid var(--term-warn);
		border-radius: 0;
		padding: 2px 0 2px 11px;
		margin: 0 0 10px;
		line-height: 1.65;
		white-space: pre-wrap;
	}
	.socials {
		display: flex;
		gap: 16px;
		padding: 10px 4px;
	}
	.socials a {
		color: var(--term-alt);
	}
	.foot {
		color: var(--term-dim);
		font-size: 0.8em;
		text-align: center;
		padding-top: 14px;
	}
</style>
