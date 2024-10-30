// routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Add debug logging
	console.log('Root layout server load - session exists:', !!locals.session);

	return {
		session: locals.session
	};
};
