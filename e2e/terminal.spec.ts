import { expect, test, type Page } from '@playwright/test';

const screen = (page: Page) => page.locator('.xterm-rows');

/** Waits for xterm to replace the HTML Banner and take the Keyboard. */
async function boot(page: Page) {
	await page.goto('/');
	await page.locator('.xterm-helper-textarea').waitFor({ state: 'attached' });
	await expect(screen(page)).toContainText('Guest@rv');
	await page.locator('.xterm-screen').click();
}

async function run(page: Page, line: string) {
	await page.keyboard.type(line);
	await page.keyboard.press('Enter');
}

test('boots into a Prompt with the Login Line above It', async ({ page }) => {
	await boot(page);
	await expect(screen(page)).toContainText('rv 1.0.0');
	await expect(screen(page)).toContainText('Guest@rv');
});

test('Enter runs a Command', async ({ page }) => {
	await boot(page);
	await run(page, 'ls');
	await expect(screen(page)).toContainText('Career/');
	await expect(screen(page)).toContainText('About.md');
});

test('cd changes the Prompt and what ls reports', async ({ page }) => {
	await boot(page);
	await run(page, 'cd Career');
	await expect(screen(page)).toContainText('~/Career$');
	await run(page, 'ls');
	await expect(screen(page)).toContainText('Solace-Reliability.md');
});

test('Tab completes a Command', async ({ page }) => {
	await boot(page);
	await page.keyboard.type('pw');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	await expect(screen(page)).toContainText('~');
});

test('Tab lists the Options when the Word cannot be extended', async ({ page }) => {
	await boot(page);
	await page.keyboard.type('c');
	await page.keyboard.press('Tab');
	await expect(screen(page)).toContainText('clear');
	await expect(screen(page)).toContainText('cat');
});

test('Arrow Up recalls the previous Command', async ({ page }) => {
	await boot(page);
	await run(page, 'pwd');
	await page.keyboard.press('ArrowUp');
	await expect(screen(page)).toContainText('$ pwd');
	await page.keyboard.press('Enter');
	await expect(screen(page)).toContainText('~');
});

test('Ctrl+C abandons the Line without running It', async ({ page }) => {
	await boot(page);
	await page.keyboard.type('cd Career');
	await page.keyboard.press('Control+c');
	await page.keyboard.press('Enter');
	// The Prompt never moved, so the Command did not run.
	await expect(screen(page)).not.toContainText('~/Career$');
	await expect(screen(page)).toContainText('^C');
});

test('an unknown Command answers instead of going silent', async ({ page }) => {
	await boot(page);
	await run(page, 'lss');
	await expect(screen(page)).toContainText('I do not know that One');
});

test('theme switching repaints and survives a Reload', async ({ page }) => {
	await boot(page);
	await run(page, 'theme paper');
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'paper');
});
