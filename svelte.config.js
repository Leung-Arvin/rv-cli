import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Workers AI only exists remotely. Locally the Agent falls back to its
			// honest "I only wake up on Cloudflare" Reply instead of asking for a Token.
			platformProxy: { configPath: 'wrangler.dev.toml' }
		})
	}
};
