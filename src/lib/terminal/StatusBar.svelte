<script lang="ts">
	import { agentStatus, promptPath, questionsLeft, terminalReady, themeName } from '../state/stores';
	import { getTheme } from '../themes/applyTheme';

	let { narrow = false }: { narrow?: boolean } = $props();

	let clock = $state('');
	$effect(() => {
		const tick = () => {
			clock = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		};
		tick();
		const id = setInterval(tick, 30_000);
		return () => clearInterval(id);
	});

	const agentLabel = $derived(
		{
			idle: 'Agent idle',
			thinking: 'Agent thinking…',
			streaming: 'Agent streaming…',
			unreachable: 'Agent unreachable'
		}[$agentStatus]
	);
</script>

<div class="bar">
	<span>
		<span class="alt">{$promptPath}</span>
		<span class="dim">·</span>
		{getTheme($themeName).label}
		{#if clock}
			<span class="dim">·</span> {clock}
		{/if}
	</span>

	{#if $terminalReady || narrow}
		<span class:busy={$agentStatus === 'streaming' || $agentStatus === 'thinking'}>
			{agentLabel} <span class="dim">· {$questionsLeft}/10 Questions left</span>
		</span>
	{:else}
		<span class="dim">loading xterm.js…</span>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 15px;
		background: var(--chrome-bar);
		border-top: 1px solid var(--chrome-line);
		color: var(--term-dim);
		font-size: 0.86em;
	}
	.alt {
		color: var(--term-alt);
	}
	.dim {
		opacity: 0.75;
	}
	.busy {
		color: var(--term-warn);
	}
</style>
