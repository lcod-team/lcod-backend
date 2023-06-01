import path from 'path';
import fs from 'fs/promises';
import { normalizePath } from 'vite';

/**
 *
 * @returns {import('vite').Plugin}
 */
export function lcodBackendConfig() {
	const backendsFile = './.lcod-backend/backends.d.mjs';
	(async () => {
		await fs.mkdir('./.lcod-backend', {
			recursive: true
		});
		await fs.writeFile(backendsFile, 'export default {}', 'utf8');
	})();

	const allServer = new Map();

	let isWriting = 0;
	async function doWrite() {
		if (isWriting >= 1) {
			isWriting = 2;
			return;
		}
		isWriting = 1;
		let txt = '';
		for (let entry of allServer) {
			txt += `import ${entry[0]} from '${entry[1]}';\n`;
		}

		txt += '\nexport default {\n';

		for (let entry of allServer) {
			txt += `\t${entry[0]},\n`;
		}

		txt += '}\n';

		await fs.writeFile(backendsFile, txt, 'utf8');
		if (isWriting != 1) {
			isWriting = 0;
			await doWrite();
		}
	}

	return {
		name: 'lcod-backend-config',
		resolveId: {
			order: 'pre',
			async handler(source, importer, options) {
				let m;
				if (source == 'lcod-backend/client' || source == '$lib/lcod-backend-client.mjs') {
					if ((m = importer.match(/.*\/(.*?)\.lcod\/.*?\.svelte$/))) {
						const resolved = await this.resolve(source, importer, { skipSelf: true });
						if (resolved) {
							return {
								id: `${resolved.id}?lcod=${m[1]}`,
								meta: { lcod: m[1] }
							};
						}
					}
				}
				if ((m = source.match(/\/(.*?)\.lcod$/))) {
					const srvPath = path.join(importer, '..', source, 'server.mjs');
					try {
						await fs.access(srvPath, fs.constants.F_OK);
						const curPath = path.resolve('../src/lib');
						const relative = `./${normalizePath(path.relative(curPath, srvPath))}`;
						allServer.set(m[1], relative);
						await doWrite();
					} catch (e) {
						console.log('lcod-backend-config error: ' + e);
					}
				}
				return null;
			}
		},
		transform: {
			async handler(code, id) {
				let m;
				if ((m = id.match(/lcod-backend-client\.mjs\?lcod=(.*)/))) {
					code = code.replace(/(lcodName = )''/, `$1'${m[1]}'`);
					return code;
				}
				return null;
			}
		}
	};
}
