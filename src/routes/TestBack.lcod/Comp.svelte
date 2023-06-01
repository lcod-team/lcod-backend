<script>
	import { onMount } from 'svelte';
	import { lcodName, call } from '$lib/lcod-backend-client.mjs';

	let fromBack = 'loading...';
	let test = '??';
	onMount(async () => {
		fromBack = (await call({ min: 100, max: 200 })).rnd;
		if (fromBack >= 100 && fromBack <= 200) {
			test = 'ok';
		} else {
			test = `bad response: ${fromBack}`;
		}
	});
</script>

<h1 title={fromBack}>{lcodName} here {test}</h1>
