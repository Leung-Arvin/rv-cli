import { describe, expect, it } from 'vitest';
import { isAllowed } from './links';

describe('isAllowed', () => {
	it('allows the Domains on the List', () => {
		expect(isAllowed('https://github.com/Leung-Arvin')).toBe(true);
		expect(isAllowed('https://www.linkedin.com/in/arvin-leung')).toBe(true);
		expect(isAllowed('https://arvin.dev/')).toBe(true);
	});

	it('refuses a Domain that is simply not on It', () => {
		expect(isAllowed('https://example.com')).toBe(false);
	});

	it('refuses a Scheme that is not http or https', () => {
		expect(isAllowed('javascript:alert(1)')).toBe(false);
		expect(isAllowed('data:text/html,<script>alert(1)</script>')).toBe(false);
		expect(isAllowed('file:///etc/passwd')).toBe(false);
	});

	it('is not fooled by an Allowlisted Host in the Userinfo', () => {
		// The Host here is evil.com. This is the Shape most Allowlists get wrong.
		expect(isAllowed('https://github.com@evil.com/')).toBe(false);
	});

	it('is not fooled by an Allowlisted Host used as a Subdomain Prefix', () => {
		expect(isAllowed('https://github.com.evil.com/')).toBe(false);
	});

	it('is not fooled by an Allowlisted Host in the Path or Query', () => {
		expect(isAllowed('https://evil.com/github.com')).toBe(false);
		expect(isAllowed('https://evil.com/?next=https://github.com')).toBe(false);
	});

	it('refuses an unlisted Subdomain of an allowed Domain', () => {
		// Only the exact Hosts are listed, so this stays a deliberate Decision
		// rather than an Accident of String matching.
		expect(isAllowed('https://pages.github.com/')).toBe(false);
	});

	it('ignores Case in the Host', () => {
		expect(isAllowed('https://GitHub.COM/Leung-Arvin')).toBe(true);
	});

	it('refuses Garbage instead of throwing', () => {
		expect(isAllowed('not a url')).toBe(false);
		expect(isAllowed('')).toBe(false);
		expect(isAllowed('//github.com')).toBe(false);
	});
});
