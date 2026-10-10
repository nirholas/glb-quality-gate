# three.ws GLB Quality Gate

<!-- three.ws:badges -->
[![GitHub stars](https://img.shields.io/github/stars/nirholas/glb-quality-gate?style=flat&logo=github)](https://github.com/nirholas/glb-quality-gate/stargazers) [![License](https://img.shields.io/github/license/nirholas/glb-quality-gate?style=flat)](https://github.com/nirholas/glb-quality-gate/blob/HEAD/LICENSE) [![Last commit](https://img.shields.io/github/last-commit/nirholas/glb-quality-gate?style=flat)](https://github.com/nirholas/glb-quality-gate/commits) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat)](https://github.com/nirholas/glb-quality-gate/pulls) [![AI agent friendly](https://img.shields.io/badge/AI%20agents-AGENTS.md%20%2B%20llms.txt-6d5dfc?style=flat)](https://github.com/nirholas/glb-quality-gate/blob/HEAD/AGENTS.md)
<!-- /three.ws:badges -->


A GitHub Action that explains what changed inside every `.glb` modified by a pull request. It
distinguishes harmless re-exports from changed materials, geometry, hierarchy, skeletons, and
animation clips, then comments the result and writes the same report to the workflow summary.

## Use it

```yaml
name: Review 3D models

on:
  pull_request:
    paths:
      - "**/*.glb"

permissions:
  contents: read
  pull-requests: write

jobs:
  glb-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: nirholas/glb-quality-gate@v1
        with:
          fail-on: breaking
```

No checkout step is required. The Action reads both model versions through the GitHub API,
which also avoids incomplete shallow-clone comparisons.

## Severity

| Level | Meaning |
| --- | --- |
| `none` | The models are structurally identical. |
| `cosmetic` | Metadata changed without an observable rendering change. |
| `minor` | Appearance changed while the model's structure remained usable. |
| `major` | Geometry or hierarchy changed and dependent content should be checked. |
| `breaking` | A named mesh, material, joint, or animation dependency disappeared. |

Added files are `minor`; removed files are `breaking`. Renames compare the previous path with
the new path. The default threshold fails only at `breaking`.

## Inputs and outputs

| Name | Default | Purpose |
| --- | --- | --- |
| `github-token` | `github.token` | Reads the base/head files and creates or updates the report comment. |
| `fail-on` | `breaking` | First severity that fails the job. |
| `max-files` | `20` | Review cap for a single pull request, from 1 to 100. |
| output `severity` | | Highest severity across reviewed models. |
| output `files-checked` | | Number of GLB files included in the report. |

Pull requests from forks may receive a read-only token. The Action still writes the workflow
summary and applies the gate; it emits a warning when GitHub refuses the comment.

## Development

```bash
npm ci
npm test
npm run build
```

`dist/index.js` is committed because JavaScript Actions execute the bundled file. The diff
engine is the published [`@three-ws/glb-diff`](https://www.npmjs.com/package/@three-ws/glb-diff)
package, the same engine used by the [visual model diff](https://three.ws/diff).

## Release

After tests and the bundle pass, tag a release and move the stable major tag:

```bash
git tag -a v1.0.0 -m "three.ws GLB Quality Gate v1.0.0"
git tag -f v1 v1.0.0
git push origin v1.0.0
git push --force origin v1
```

The dedicated public repository and root `action.yml` make it eligible for publication in the
[GitHub Marketplace](https://docs.github.com/en/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace).

## License

Apache-2.0

<!-- three.ws:growth -->
## Support the project

If glb-quality-gate saves you time, **[star it on GitHub](https://github.com/nirholas/glb-quality-gate)**. Stars are how other developers and AI agents find the repositories worth trusting, and they cost you one click.

Know someone who would use it? [Post on X](https://twitter.com/intent/tweet?text=glb-quality-gate%3A%20GitHub%20Action%20that%20reviews%20every%20pull%20request%20that%20changes%20a%20GLB%3A%20diffs%20geometry%2C%20materials&url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fglb-quality-gate) · [Share on Bluesky](https://bsky.app/intent/compose?text=glb-quality-gate%3A%20GitHub%20Action%20that%20reviews%20every%20pull%20request%20that%20changes%20a%20GLB%3A%20diffs%20geometry%2C%20materials%20https%3A%2F%2Fgithub.com%2Fnirholas%2Fglb-quality-gate) · [Share on LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fglb-quality-gate) · [Submit to Hacker News](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fgithub.com%2Fnirholas%2Fglb-quality-gate&t=glb-quality-gate%3A%20GitHub%20Action%20that%20reviews%20every%20pull%20request%20that%20changes%20a%20GLB%3A%20diffs%20geometry%2C%20materials) · [Share on Reddit](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fglb-quality-gate&title=glb-quality-gate%3A%20GitHub%20Action%20that%20reviews%20every%20pull%20request%20that%20changes%20a%20GLB%3A%20diffs%20geometry%2C%20materials)

## Built for AI agents too

Coding agents and LLM tooling can read this repo directly: [AGENTS.md](./AGENTS.md), [llms.txt](./llms.txt), [llms-full.txt](./llms-full.txt). Point an agent at `https://github.com/nirholas/glb-quality-gate` and it has the context it needs.

## More from the same author

- [All repositories by nirholas](https://github.com/nirholas/nirholas#readme): the full catalog, grouped by topic
- [three.ws](https://three.ws): the platform for 3D AI agents with Solana wallets, a skill marketplace and x402 payments
- Questions or ideas: [open an issue](https://github.com/nirholas/glb-quality-gate/issues) or [start a discussion](https://github.com/nirholas/glb-quality-gate/discussions)

## Contributors

[![Contributors](https://contrib.rocks/image?repo=nirholas/glb-quality-gate)](https://github.com/nirholas/glb-quality-gate/graphs/contributors)

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=nirholas/glb-quality-gate&type=Date)](https://www.star-history.com/#nirholas/glb-quality-gate&Date)

<!-- /three.ws:growth -->
