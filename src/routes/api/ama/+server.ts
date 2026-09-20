import { sanitize, SYSTEM_PROMPT_FALLBACK } from '$lib/server/sanitize';
import { error, type RequestHandler } from '@sveltejs/kit';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';
const MAX_QUESTION = 500;

const textStream = (text: string) =>
	new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(text));
			controller.close();
		}
	});

/** Workers AI streams SSE. The Terminal wants Text, sanitized, nothing else. */
function sseToText(): TransformStream<Uint8Array, Uint8Array> {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let buffer = '';

	return new TransformStream({
		transform(chunk, controller) {
			buffer += decoder.decode(chunk, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';

			for (const line of lines) {
				if (!line.startsWith('data:')) continue;
				const payload = line.slice(5).trim();
				if (payload === '' || payload === '[DONE]') continue;
				try {
					const parsed = JSON.parse(payload) as { response?: string };
					if (parsed.response) controller.enqueue(encoder.encode(sanitize(parsed.response)));
				} catch {
					// A half-delivered Frame is not worth killing the Stream over.
				}
			}
		}
	});
}

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	let question: unknown;
	try {
		({ question } = (await request.json()) as { question?: unknown });
	} catch {
		error(400, 'Bad Request');
	}

	if (typeof question !== 'string' || question.trim() === '' || question.length > MAX_QUESTION) {
		error(400, 'Ask a real Question, under 500 Characters.');
	}

	const env = platform?.env;

	if (env?.AMA_LIMITER) {
		const { success } = await env.AMA_LIMITER.limit({ key: getClientAddress() });
		if (!success) {
			return new Response('Rate limited', {
				status: 429,
				headers: { 'x-ratelimit-remaining': '0' }
			});
		}
	}

	if (!env?.AI) {
		return new Response(
			textStream(
				'I only wake up on Cloudflare — there is no Workers AI binding in this local Run.\nEverything else on this Site works without Me, which is rather the Point.'
			),
			{ headers: { 'content-type': 'text/plain; charset=utf-8' } }
		);
	}

	const systemPrompt = (await env.PROMPTS?.get('system')) ?? SYSTEM_PROMPT_FALLBACK;

	const result = (await env.AI.run(MODEL, {
		stream: true,
		max_tokens: 300,
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: question }
		]
	})) as ReadableStream<Uint8Array>;

	return new Response(result.pipeThrough(sseToText()), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
};
