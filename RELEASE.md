# Releasing three.ws GLB Quality Gate

This is the release runbook for `nirholas/glb-quality-gate`. The source of truth is
`satellites/glb-quality-gate` in the three.ws monorepo, and the public repository is a one-way
export of it. The repository owner runs every command below. Nothing here runs automatically.

## v1.0.0 release notes

**three.ws GLB Quality Gate v1.0.0** explains what changed inside every `.glb` file a pull
request touches, and fails the check when a change would break content that depends on it.

- **Finds every changed GLB in the pull request** through the pull request files API. No
  checkout step is needed, and a shallow clone can never produce a half-compared model.
- **Reads both versions byte for byte** from the base and head commits and compares them with
  [`@three-ws/glb-diff`](https://www.npmjs.com/package/@three-ws/glb-diff), the engine behind
  the [three.ws visual model diff](https://three.ws/diff).
- **Understands structure, not bytes.** A re-export that only rewrote the binary layout is
  reported as identical. Changes to meshes, materials, textures, node hierarchy, skeletons, and
  animation clips are reported one by one, with git-style rename and move detection.
- **Reads meshopt-compressed models.** `EXT_meshopt_compression` is decoded before comparison,
  so optimized web avatars and scenes are reviewed like any other model.
- **Classifies every file** as `none`, `cosmetic`, `minor`, `major`, or `breaking`. Added files
  are `minor`, removed files are `breaking`, and renamed files are compared with their previous
  path.
- **Keeps one report per pull request.** The comment is created once and updated in place on
  every push, and the same report is written to the workflow job summary.
- **Works on fork pull requests.** When GitHub gives the workflow a read-only token, the Action
  still writes the job summary and applies the gate, and warns instead of failing on the
  comment.
- **Fails at your threshold.** `fail-on` (default `breaking`) sets the first severity that fails
  the check. `max-files` (default `20`, at most `100`) caps very large pull requests and notes
  how many files were left out.
- **Exposes outputs** `severity` and `files-checked` for later steps.
- **Runs on the Node 24 Actions runtime** from one committed bundle, with no install step.

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

## 0. Build and verify the export

From the monorepo. The exporter installs the locked dependencies, runs the tests, rebuilds the
bundle, and stops if the rebuilt `dist/` differs from the committed one.

```bash
cd /workspaces/three.ws
npm run export:growth-satellites -- --target glb-quality-gate
```

A passing run ends with a line like `glb-quality-gate: 16 files, commit <sha>` and leaves the
tree in `/workspaces/three.ws/dist/growth-satellites/glb-quality-gate`.

## 1. Push the export to the public repository

The public repository already has one commit (`d6edb36`, "feat: publish glb-quality-gate").
The new export goes on top of it as an ordinary commit, so no force push is needed.

This codespace's default `GITHUB_TOKEN` belongs to an account without write access to
`nirholas/*`, so every command that talks to GitHub runs without it, as the `nirholas` account.

```bash
gh auth switch --user nirholas
rm -rf /workspaces/glb-quality-gate-release
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  clone https://github.com/nirholas/glb-quality-gate.git /workspaces/glb-quality-gate-release
rsync -a --delete --exclude .git --exclude node_modules \
  /workspaces/three.ws/dist/growth-satellites/glb-quality-gate/ /workspaces/glb-quality-gate-release/
cd /workspaces/glb-quality-gate-release
git status --short
```

`git status --short` should list `RELEASE.md`, `action.yml`, `package.json`,
`package-lock.json`, `scripts/build.mjs`, `test/report.test.js`, and the rebuilt `dist/` files
(`dist/384.index.js` removed, `dist/515.index.js` added). Then:

```bash
git add --all
git commit -m "fix: decode meshopt-compressed models, run on Node 24, and add the release runbook"
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push origin main
```

## 2. Tag v1.0.0 and the major tag v1

```bash
cd /workspaces/glb-quality-gate-release
git tag -a v1.0.0 -m "three.ws GLB Quality Gate v1.0.0"
git tag -a v1 -m "three.ws GLB Quality Gate v1" "v1.0.0^{commit}"
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push origin v1.0.0 v1
```

For every later `v1.x.y`, tag the new version the same way, then move `v1` onto it:

```bash
git tag -a v1.0.1 -m "three.ws GLB Quality Gate v1.0.1"
git tag -fa v1 -m "three.ws GLB Quality Gate v1" "v1.0.1^{commit}"
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push origin v1.0.1
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push --force origin v1
```

## 3. Create the release and publish to the Marketplace

Marketplace publication is a checkbox on the release form, so create this first release in the
browser, not with `gh release create`.

Once per account: two-factor authentication must be on for `nirholas`, and the GitHub
Marketplace Developer Agreement must be accepted (the release form asks the first time). The
repository must stay public, keep its single `action.yml` at the root, and contain no workflow
files.

1. Open <https://github.com/nirholas/glb-quality-gate/releases/new?tag=v1.0.0>.
2. Tick **Publish this Action to the GitHub Marketplace**. GitHub validates `action.yml` and
   previews the listing: name **three.ws GLB Quality Gate**, icon **box**, color **purple**,
   all read from `action.yml`.
3. **Primary category:** Code review. **Secondary category:** Continuous integration.
4. **Release title:** `v1.0.0`.
5. **Description:** paste the "v1.0.0 release notes" section above, from "three.ws GLB Quality
   Gate v1.0.0 explains" through the YAML example.
6. Leave **Set as the latest release** ticked and choose **Publish release**.

The listing name was checked on 2026-09-17: Marketplace searches for `GLB`, `GLB Quality Gate`,
and `three.ws` return no Actions, and
<https://github.com/marketplace/actions/three-ws-glb-quality-gate> is unclaimed.

## 4. Verify the release

Tags, metadata, release, and listing resolve:

```bash
git ls-remote --tags https://github.com/nirholas/glb-quality-gate.git
env -u GITHUB_TOKEN gh api "repos/nirholas/glb-quality-gate/contents/action.yml?ref=v1" --jq .name
env -u GITHUB_TOKEN gh release view v1.0.0 --repo nirholas/glb-quality-gate
curl -s -o /dev/null -w "%{http_code}\n" https://github.com/marketplace/actions/three-ws-glb-quality-gate
```

Expect `refs/tags/v1^{}` and `refs/tags/v1.0.0^{}` on the same commit, `action.yml`, the
release, and `200`.

Then prove `@v1` in a real pull request. The fine-grained token on this machine cannot create
repositories, so first create an empty **private** repository named
`glb-quality-gate-smoke` under `nirholas` in the GitHub UI (no README), and add it to the
token's repository access if the token is scoped to selected repositories. The model change is
real: the baseline is the three.ws default avatar, which is meshopt-compressed, and the change
replaces it with a different three.ws avatar.

```bash
rm -rf /workspaces/glb-quality-gate-smoke
mkdir -p /workspaces/glb-quality-gate-smoke/.github/workflows /workspaces/glb-quality-gate-smoke/models
cd /workspaces/glb-quality-gate-smoke
git init -b main
cat > .github/workflows/glb.yml <<'YAML'
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
      - id: gate
        uses: nirholas/glb-quality-gate@v1
        with:
          fail-on: breaking
      - if: always()
        run: echo "severity=${{ steps.gate.outputs.severity }} files=${{ steps.gate.outputs.files-checked }}"
YAML
curl -sfL -o models/avatar.glb https://three.ws/avatars/default.glb
git add .github/workflows/glb.yml models/avatar.glb
git commit -m "Add the GLB quality gate and a baseline avatar"
git remote add origin https://github.com/nirholas/glb-quality-gate-smoke.git
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push -u origin main
git switch -c swap-avatar
curl -sfL -o models/avatar.glb https://three.ws/avatars/cz.glb
git commit -am "Swap the avatar model"
env -u GITHUB_TOKEN git -c credential.helper= -c 'credential.helper=!gh auth git-credential' \
  push -u origin swap-avatar
env -u GITHUB_TOKEN gh pr create --repo nirholas/glb-quality-gate-smoke --head swap-avatar \
  --title "Swap the avatar model" --body "Verifies nirholas/glb-quality-gate@v1."
env -u GITHUB_TOKEN gh pr checks swap-avatar --repo nirholas/glb-quality-gate-smoke --watch
env -u GITHUB_TOKEN gh pr view swap-avatar --repo nirholas/glb-quality-gate-smoke --comments
```

Expected: the `glb-quality` job resolves `nirholas/glb-quality-gate@v1`, fails with
`GLB changes reached breaking, which meets the breaking failure threshold`, prints
`severity=breaking files=1`, and the pull request has exactly one report comment listing
`models/avatar.glb` with its structural changes. Push one more commit to `swap-avatar` and
confirm the same comment is edited rather than a second one added. The same avatar pair was
diffed locally with the release bundle's engine and reports `breaking`.

Delete the scratch repository in the GitHub UI afterwards (Settings, Danger Zone), since the
token cannot delete repositories either.

## After release

In the three.ws monorepo, update the GLB Quality Gate row in
`marketing/growth/opportunities.csv` with the Marketplace URL and add a `data/changelog.json`
entry announcing the Action.
