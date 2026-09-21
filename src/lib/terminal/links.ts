import { linkAllowlist } from '../../../content.config';

/**
 * A Link is only clickable if its Host is on the Allowlist. The Agent can write
 * any URL It likes; It cannot make a clickable One.
 */
export function isAllowed(url: string): boolean {
	try {
		const { protocol, hostname } = new URL(url);
		if (protocol !== 'https:' && protocol !== 'http:') return false;
		return linkAllowlist.includes(hostname.toLowerCase());
	} catch {
		return false;
	}
}

export function openIfAllowed(url: string): void {
	if (!isAllowed(url)) return;
	window.open(url, '_blank', 'noopener,noreferrer');
}
