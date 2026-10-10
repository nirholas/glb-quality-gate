import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ncc from '@vercel/ncc';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const entry = resolve(root, 'src/index.js');
const built = await ncc(entry, { minify: true, sourceMap: false });

// ncc turns an import it cannot resolve into a stub that only throws when the code path runs.
// A missing optional peer (meshoptimizer, which decodes EXT_meshopt_compression) therefore
// bundles cleanly and then fails on real avatars in adopters' pull requests. Refuse that bundle.
const unresolved = [built.code, ...Object.values(built.assets).map((asset) => String(asset.source))]
	.flatMap((code) => [...code.matchAll(/eval\("require"\)\("([^"]+)"\)/g)].map((match) => match[1]));
if (unresolved.length) {
	throw new Error(`the bundle has unresolved imports; add them to dependencies: ${[...new Set(unresolved)].join(', ')}`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'index.js'), built.code);

for (const [name, asset] of Object.entries(built.assets)) {
	const target = resolve(output, name);
	if (!target.startsWith(`${output}/`)) throw new Error(`bundle asset escaped dist: ${name}`);
	await mkdir(dirname(target), { recursive: true });
	await writeFile(target, asset.source);
}

console.log(`built dist/index.js and ${Object.keys(built.assets).length} runtime asset(s)`);
