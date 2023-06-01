import backends from '$lib/../../.lcod-backend/backends.d.mjs';
import { json } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
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
		const result = await backends[comp](params);
		return json(result);
	}

	const response = await resolve(event);
	return response;
}
