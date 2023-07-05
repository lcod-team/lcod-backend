export async function call(params = {}, options = {}, lcod = '') {
	if (!lcod) {
		return 'n/a';
	}
	const result = await fetch(`/lcod/${lcod}`, {
		method: 'post',
		body: JSON.stringify(params)
	});
	return await result.json();
}
