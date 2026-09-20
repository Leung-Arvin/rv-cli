import { error, json, type RequestHandler } from '@sveltejs/kit';

const MAX_CORRECTION = 1000;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	let correction: unknown;
	try {
		({ correction } = (await request.json()) as { correction?: unknown });
	} catch {
		error(400, 'Bad Request');
	}

	if (
		typeof correction !== 'string' ||
		correction.trim() === '' ||
		correction.length > MAX_CORRECTION
	) {
		error(400, 'Corrections need to be Text, under 1000 Characters.');
	}

	const env = platform?.env;

	if (env?.AMA_LIMITER) {
		const { success } = await env.AMA_LIMITER.limit({ key: getClientAddress() });
		if (!success) return new Response('Rate limited', { status: 429 });
	}

	if (env?.FEEDBACK_DB) {
		await env.FEEDBACK_DB.prepare(
			"INSERT INTO feedback (correction, created_at) VALUES (?, datetime('now'))"
		)
			.bind(correction.trim())
			.run();
	} else {
		console.info('[feedback]', correction.trim());
	}

	return json({ logged: true });
};
