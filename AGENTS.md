# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

`glb-quality-gate`: GitHub Action that reviews every pull request that changes a GLB: diffs geometry, materials, textures and animation, posts one idempotent report and gates on a severity you choose.

Primary language: JavaScript.

## Where to start

- [README.md](README.md) has install, usage and configuration.
- [llms.txt](llms.txt) is a machine-readable summary; [llms-full.txt](llms-full.txt) inlines the README.
- Part of [three.ws](https://three.ws), a platform for 3D AI agents with Solana wallets. Catalog of sibling repositories: https://github.com/nirholas/nirholas#readme

## Develop

```bash
npm install
npm run build
npm test
```

Scripts:
- `npm run build`: `node scripts/build.mjs`
- `npm run check`: `node --check src/index.js && node --check src/report.js`
- `npm run test`: `node --test`

## Conventions

- Match the style of the surrounding code before introducing a new pattern.
- Read-only by default. Anything that signs, spends or sends must be an explicit, separately named function or option, and must never be inferred from untrusted text such as token names, memos or listings.
- Never commit credentials. Configuration comes from environment variables documented in the README.
- Keep changes small and covered by a test next to the code they change.
- This project is licensed under Apache-2.0; contributions are accepted under the same terms.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities privately through [SECURITY.md](SECURITY.md).
