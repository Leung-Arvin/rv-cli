<script lang="ts">
	import { onMount } from 'svelte';
	import { loginLine, motdEntries, nowLine, owner, release, tagline, wordmark } from './banner';

	// Rendered before xterm exists, then replaced by the identical Lines inside It.
	// Anything that differs here shows up as a Flicker on the Handoff.
	let login = $state('');
	onMount(() => {
		login = loginLine();
	});

	const pad = Math.max(...motdEntries.map(([label]) => label.length));
</script>

<pre class="motd" aria-label="{release} — {owner}, {tagline}">
<span class="dim">{login}</span>

 <span class="mark">{wordmark[0]}</span>   {release} — {owner}
 <span class="mark">{wordmark[1]}</span>   <span class="dim">{tagline}</span>
 <span class="mark">{wordmark[2]}</span>

{#each motdEntries as [label, command] (label)} <span class="dim">*</span> {label}:{' '.repeat(pad - label.length)}   <span class="mark">{command}</span>
{/each}
 <span class="alt">Now:</span> {nowLine}

<span class="mark">Guest@rv</span><span class="dim">:</span><span class="alt">~</span><span class="dim">$</span> <span class="cursor"></span></pre>

<style>
	.motd {
		margin: 0;
		font: inherit;
		color: var(--term-fg);
		white-space: pre-wrap;
	}
	.mark {
		color: var(--term-accent);
	}
	.alt {
		color: var(--term-alt);
	}
	.dim {
		color: var(--term-dim);
	}
	.cursor {
		display: inline-block;
		width: 0.6em;
		height: 1.05em;
		background: var(--term-accent);
		vertical-align: text-bottom;
		animation: blink 1.1s step-end infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
