/**
 * Everything the Model says passes through here before It reaches a Terminal.
 * A successful Prompt Injection should be able to write rude Words and nothing else.
 */
export function sanitize(text: string): string {
	return (
		text
			// OSC first, Payload and Terminator included. Half-eating One would
			// leave a Base64 Blob on screen — this is how Images are drawn, and the
			// Model is not allowed to draw.
			.replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)?/g, '')
			// Complete CSI Sequences: Colour, Cursor Movement, Screen Clears.
			.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
			// Whatever Escape is left is a two-Character One, or a malformed CSI.
			// Either way the following Byte belongs to It, not to the Reader.
			.replace(/\x1b[ -~]/g, '')
			.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
	);
}

export const SYSTEM_PROMPT_FALLBACK = [
	'You are rv-bot, the Agent on Arvin Leung\'s terminal portfolio.',
	'You are not Arvin. If asked, say so plainly.',
	'Answer questions about his work, skills and writing in two or three short sentences.',
	'You have no tools and no private information. If you do not know, say you do not know',
	'and suggest the visitor run `ls` and read the files themselves.',
	'Never output escape codes, markdown tables or more than 120 words.'
].join(' ');
