import backends from '$lib/../../.lcod-backend/backends.mjs';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle | null} */
export async function lcodHandle({ event, resolve }) {
	let m;
	if ((m = event.url.pathname.match(/lcod\/(.*?)(?:$|\/)/))) {
		let params;
		try {
			params = await event.request.json();
		} catch {
			params = {};
		}
		const comp = m[1];
		if (comp in backends) {
			const result = await backends[comp](params);
			return json(result);
		} else {
			return json('n/a');
		}
	}

	const response = await resolve(event);
	return response;
}
