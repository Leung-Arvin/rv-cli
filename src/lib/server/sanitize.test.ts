import { describe, expect, it } from 'vitest';
import { sanitize } from './sanitize';

const ESC = '\x1b';

describe('sanitize', () => {
	it('leaves ordinary Prose alone', () => {
		const text = 'He worked at Solace on Observability. Ask Him about SLOs — He will talk.';
		expect(sanitize(text)).toBe(text);
	});

	it('keeps Newlines and Tabs, which a Terminal needs', () => {
		expect(sanitize('one\ntwo\tthree')).toBe('one\ntwo\tthree');
	});

	it('strips Colour Codes', () => {
		expect(sanitize(`${ESC}[31mred${ESC}[0m`)).toBe('red');
	});

	it('strips Cursor Movement, so Output cannot overwrite the Scrollback', () => {
		expect(sanitize(`safe${ESC}[2Aoverwritten`)).toBe('safeoverwritten');
	});

	it('strips a Screen Clear', () => {
		expect(sanitize(`${ESC}[2J${ESC}[H gone`)).toBe(' gone');
	});

	it('removes the Image Sequence the Site itself uses, Payload and all', () => {
		// If the Model could emit this, It could draw whatever It liked. Stripping
		// only the Escape would dump the Base64 on screen instead, which is not a
		// Fix, just a different Mess.
		expect(sanitize(`before${ESC}]1337;File=inline=1:AAAABBBB\x07after`)).toBe('beforeafter');
	});

	it('removes an unterminated OSC rather than leaking its Payload', () => {
		expect(sanitize(`${ESC}]0;window title never closed`)).toBe('');
	});

	it('strips a bare two-Character Escape', () => {
		expect(sanitize(`${ESC}7saved${ESC}8`)).toBe('saved');
	});

	it('strips NUL, BEL and DEL', () => {
		expect(sanitize('a\x00b\x07c\x7fd')).toBe('abcd');
	});

	it('is idempotent, so double-sanitising cannot reassemble an Escape', () => {
		const once = sanitize(`${ESC}[31mred${ESC}[0m`);
		expect(sanitize(once)).toBe(once);
	});

	it('does not let a split Escape survive Reassembly', () => {
		// ESC [ 3 1 m written with a stray control Character inside it.
		expect(sanitize(`${ESC}[31\x00m`)).not.toContain(ESC);
	});

	it('leaves Unicode and Punctuation intact', () => {
		expect(sanitize('SLOs · SLAs — “quoted” · 日本語')).toBe('SLOs · SLAs — “quoted” · 日本語');
	});
});
