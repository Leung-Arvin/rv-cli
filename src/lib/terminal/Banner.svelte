<script lang="ts">
	import { onMount } from 'svelte';
	import { lastVisitLine, nowLine, owner, tagline, wordmark } from './banner';

	let visit = $state('');
	onMount(() => {
		visit = lastVisitLine();
	});
</script>

<pre class="banner" aria-label="rv — {owner}, {tagline}">
  <span class="mark">{wordmark[0]}</span>
  <span class="mark">{wordmark[1]}</span>   {owner}
  <span class="mark">{wordmark[2]}</span>   <span class="dim">{tagline}</span>

  <span class="dim">{visit}</span>

  <span class="alt">Now:</span> {nowLine[0]}
       {nowLine[1]}

  Type <span class="mark">help</span> for Commands. Type <span class="mark">ama &lt;Question&gt;</span> to ask My Agent
  something It will answer with more Confidence than Accuracy.

  <span class="dim">booting…</span><span class="cursor"></span>
</pre>

<style>
	.banner {
		margin: 0;
		padding: 15px 17px;
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
		margin-left: 0.4em;
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
