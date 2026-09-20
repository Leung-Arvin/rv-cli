declare global {
	namespace App {
		interface Platform {
			env?: {
				AI?: { run(model: string, input: unknown): Promise<unknown> };
				PROMPTS?: KVNamespace;
				FEEDBACK_DB?: D1Database;
				AMA_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
			};
		}
	}
}

export {};
