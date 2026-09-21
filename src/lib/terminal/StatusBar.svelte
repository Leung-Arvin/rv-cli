<script lang="ts">
	import { agentStatus, promptPath, questionsLeft, themeName } from '../state/stores';
	import { getTheme } from '../themes/applyTheme';

	let clock = $state('');
	$effect(() => {
		const tick = () => {
			clock = new Date().toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});
		};
		tick();
		const id = setInterval(tick, 30_000);
		return () => clearInterval(id);
	});

	const agentLabel = $derived(
		{
			idle: 'agent idle',
			thinking: 'agent thinking',
			streaming: 'agent streaming',
			unreachable: 'agent unreachable'
		}[$agentStatus]
	);
</script>

<!-- A tmux status line, not an App Bar: a Terminal is allowed to have One of these. -->
<div class="bar">
	<span class="left">
		<span class="session">[rv]</span>
		<span class="window">0:{getTheme($themeName).label.toLowerCase()}*</span>
		<span class="path">{$promptPath}</span>
	</span>

	<span class="right">
		<span class:busy={$agentStatus === 'streaming' || $agentStatus === 'thinking'}>
			{agentLabel}
		</span>
		<span class="dim">{$questionsLeft}/10</span>
		<span class="clock">{clock}</span>
	</span>
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		gap: 12px;
		background: var(--chrome-bar);
		color: var(--term-dim);
		font-size: 0.86em;
		line-height: 1.9;
		overflow: hidden;
		white-space: nowrap;
	}
	.left,
	.right {
		display: flex;
		align-items: stretch;
		gap: 10px;
		min-width: 0;
	}
	.right {
		padding-right: 10px;
	}
	.session {
		background: var(--term-accent);
		color: var(--term-bg);
		padding: 0 9px;
	}
	.window {
		color: var(--term-fg);
	}
	.path {
		color: var(--term-alt);
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.busy {
		color: var(--term-warn);
	}
	.clock {
		color: var(--term-fg);
	}
</style>
