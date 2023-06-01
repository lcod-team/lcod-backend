import { lcodHandle } from './lib/lcod-backend.mjs';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await lcodHandle({ event, resolve });
	return response;
}
