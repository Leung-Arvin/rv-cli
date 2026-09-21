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
	<StatusBar />
</main>

<style>
	/* Edge to edge. A Terminal is the Window, not a Card inside One. */
	main {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}
	main :global(> :first-child) {
		flex: 1;
		min-height: 0;
	}
	.frame {
		overflow-y: auto;
		background: var(--term-bg);
	}
</style>
