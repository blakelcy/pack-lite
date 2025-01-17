// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: locals.session,
		user: locals.session?.user ?? null,
		// Initialize with default preferences - could be loaded from database
		preferences: {
			theme: 'system',
			notifications: {
				enabled: false,
				email: false,
				push: false
			},
			version: 1,
			lastUpdated: new Date().toISOString()
		}
	};
};
