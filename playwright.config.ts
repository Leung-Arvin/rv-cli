import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;

export default defineConfig({
	testDir: 'e2e',
	// One Worker on purpose. Ten Pages hitting a cold Vite Dev Server at once
	// leaves most of Them waiting on Dep Optimisation until They time out — a
	// Dev-server Limit, not an App one. Serial, the whole Suite runs in seconds.
	workers: 1,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',

	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'on-first-retry'
	},

	// Desktop only. The narrow Layout is a different Component with no Terminal
	// in It, so It belongs in its own Spec rather than a second Viewport here.
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

	webServer: {
		command: `npm run dev -- --port ${PORT}`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
