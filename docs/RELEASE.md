# Release Runbook

## Current Status

0.1.0 was published in EP-07. UI-09 implemented the opt-in foundation expansion;
UI-10 validated the packaged artifact in temporary Web/Admin consumers. UI-11
prepares version 0.2.0 locally. It does not authorize commit, push or publication.
See [0.2.0 release notes](RELEASE-0.2.0.md).

Both real consumers currently remain pinned to 0.1.0. No consumer migration is
included. Never publish the expanded contract under 0.1.0 or overwrite a version.

## Configuration and Access

The package name remains `@mosaique-evenements-inc/ui`; publishConfig targets
`https://npm.pkg.github.com`. The versioned .npmrc routes only this scope.
No credentials are stored in the repository. `private: false` permits publishing;
it does not make the registry package publicly readable.

The manual workflow runs only on main with `contents: read` and `packages: write`.
It compares the explicit version input to package.json, installs with the frozen
lockfile and runs checks. A paginated GitHub Packages history query refuses an
already-published version. An API/auth failure, malformed or empty history stops
publication; a 404 is not treated as proof of availability. This package already
has release history, so first-ever publication is intentionally not supported by
that guard. The workflow packs once, inspects the archive and publishes that same
archive using `--ignore-scripts`. It never deletes a version or attempts recovery
by overwriting. A race with an external publisher must fail at the registry.

The preflight uses GITHUB_TOKEN as GH_TOKEN; setup-node supplies registry auth
configuration and the publish step exposes GITHUB_TOKEN as NODE_AUTH_TOKEN.
These are step-scoped environment references, never literal secrets. Installation
and checks do not receive these variables. UI-11 does not dispatch the workflow.

Grant each consumer repository appropriate package read access for GitHub Actions.
Actions access does not supply credentials to external deployment hosts. Those
hosts must separately provide a package-read credential and npm authentication
mapping for their actual environment, including Preview when needed. Never paste
credentials into package.json, lockfiles, logs or source. No secrets are changed
by this episode.

## Release Order

Execute only after separate authorization:

1. Validate mosaique-ui.
2. Review diff.
3. Commit UI-09/UI-11 changes.
4. Push main.
5. Run publish workflow for 0.2.0.
6. Verify GitHub Package.
7. Migrate Admin first.
8. Validate Admin.
9. Migrate Web.
10. Validate Web.

For step 1 run `pnpm format`, `pnpm check`, `pnpm pack --json` and
`git diff --check`; inspect all archive entries and resolve all three exports.
For step 5 dispatch `Publish package` on main with version input exactly `0.2.0`.
For step 6 verify authenticated metadata, version, repository, integrity and
archive contents; test installation from the registry, not a local tarball.
Do not equate a local validation PASS with a completed registry publication.

## Future Consumer Migration

Commands are documented, NOT executed in UI-11. After registry verification,
run in Admin first, then Web:

```sh
pnpm add --save-exact @mosaique-evenements-inc/ui@0.2.0
```

Updating the dependency alone must not restyle either app. Admin adoption needs
explicit Tailwind adapter/component work for typography, status and density, plus
recipes.css where appropriate. To let utilities override recipes, declare the
order before imports:

```css
@layer theme, base, mosaique, components, utilities;
```

Web keeps Cinzel/display, cinematic motion, editorial recipes and its existing
CTA system. Shared body/control/status adoption is selective and separately
reviewed. Keep font delivery consumer-owned. Test fallback before loading fonts.

Validate Admin with format:check, lint, typecheck, build and representative
login/shell/recipe browser checks. Validate Web with lint, typecheck, build,
diff-check and representative editorial/form checks. Review wrapping, focus,
invalid/disabled states, density, cascade, reduced motion and overflow at
390/768/1440px. Do not merge failed migrations.

## Rollback

- If publication fails, fix and retry 0.2.0 only after authenticated history
  confirms it does not exist. An uncertain result is a reason to stop and inspect.
- If 0.2.0 exists, never overwrite or delete/reuse it. Prepare an explicitly
  approved 0.2.1 for corrections, including updating release guards and notes.
- Consumers may remain on exact 0.1.0 until migration succeeds. If a migration
  regresses, restore the approved 0.1.0 dependency/lockfile and matching consumer
  styles together. Do not mask the issue by changing authentication or UI scope.

## References

- [GitHub Packages REST API](https://docs.github.com/en/rest/packages/packages)
- [GitHub npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
