import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Never inline a Screenshot into the JS Bundle. They are fetched only when
		// someone actually cats One, which keeps Them off the Critical Path.
		assetsInlineLimit: 0
	},
	server: {
		// Screenshots live beside the Markdown that references Them. Vite emits
		// Them properly at Build; in Dev it needs Permission to serve content/.
		fs: { allow: ['.'] }
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
