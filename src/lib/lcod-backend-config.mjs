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
				if (source == '@lcod/backend/client' || source == '$lib/lcod-backend-client.mjs') {
					if ((m = importer.match(/.*\/(.*?)\.lcod\/.*?\.svelte$/))) {
						return `lcod/${m[1]}/${source}`;
					}
				}
				if ((m = source.match(/\/([^/]*?)\.lcod$/))) {
					let { id } = await this.resolve(source, importer, { skipSelf: true });
					const srvPath = path.join(id, '../server.mjs');
					try {
						await fs.access(srvPath, fs.constants.F_OK);
						const curPath = path.resolve('./.lcod-backend/');
						const relative = `./${normalizePath(path.relative(curPath, srvPath))}`;
						allServer.set(m[1], relative);
						await doWrite();
					} catch (e) {
						//console.log('lcod-backend-config error: ' + e);
					}
				}
				return null;
			}
		},
		load: {
			async handler(id) {
				let m;
				if ((m = id.match(/^lcod\/(.*?)\/(.*)/))) {
					const code = `import { call as call_ } from '${m[2]}';\n`
						+ `export const lcodName = '${m[1]}';\n`
						+ `export async function call(params, options) {\n`
						+ `  return await call_(params, options, lcodName);\n`
						+ `}`;
					return code;
				}
				return null;
			}
		}
	};
}
