export const lcodName = '';

export async function call(params, options, lcod) {
	const result = await fetch(`/lcod/${lcod ?? lcodName}`, {
		method: 'post',
		body: JSON.stringify(params ?? {})
	});
	return await result.json();
}
