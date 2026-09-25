<script lang="ts">
	import { socials } from '../../../content.config';
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
