import { error } from '@sveltejs/kit';

/**
 * @param {{ min: any; max: any; }} data
 */
export default function handle(data) {
	const min = Number(data.min ?? '0');
	const max = Number(data.max ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		throw error(400, 'min and max must be numbers, and min must be less than max');
	}

	const rnd = '' + Math.round(min + Math.random() * d);
	return { rnd };
}
