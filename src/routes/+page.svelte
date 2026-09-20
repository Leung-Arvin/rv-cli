<script lang="ts">
	import MobileFallback from '$lib/terminal/MobileFallback.svelte';
	import StatusBar from '$lib/terminal/StatusBar.svelte';
	import Terminal from '$lib/terminal/Terminal.svelte';
	import { buildVfs } from '$lib/vfs/build';
	import { onMount } from 'svelte';

	const vfs = buildVfs();
	let narrow = $state(false);

	onMount(() => {
		const query = window.matchMedia('(max-width: 767px), (pointer: coarse)');
		const sync = () => (narrow = query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});
</script>

<main>
	{#if narrow}
		<div class="frame"><MobileFallback {vfs} /></div>
	{:else}
		<Terminal {vfs} />
	{/if}
	<StatusBar {narrow} />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		max-width: 1100px;
		margin: 0 auto;
		padding: 16px 16px 0;
	}
	main :global(> :first-child) {
		flex: 1;
		min-height: 0;
	}
	.frame {
		overflow-y: auto;
		background: var(--term-bg);
		border-radius: 10px;
	}
	main :global(.bar) {
		border-radius: 0 0 10px 10px;
		margin-bottom: 16px;
	}
</style>
