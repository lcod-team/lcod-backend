export default async function handle(data) {
	const res = await fetch('https://ifconfig.io', {
		headers: { 'User-Agent': 'curl' }
	});
	return await res.text();
}
