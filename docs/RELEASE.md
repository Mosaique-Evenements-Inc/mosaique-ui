# First Publication Runbook

Status: prepared in EP-06, not published. Keep version `0.1.0`; no earlier release
has been established in this work. Before publication, verify the authenticated
registry history. A missing/unauthorized response is not proof that a version is
available. Never overwrite or automatically bump an existing version.

## Configuration and Access

The versioned `.npmrc` routes `@mosaique-evenements-inc` to
`https://npm.pkg.github.com`; other scopes retain their default registry.
`publishConfig.registry` independently protects the publication destination.
Do not add `always-auth`: current setup-node documentation deprecates that input.

GitHub Actions publication uses the repository `GITHUB_TOKEN`, with only
`contents: read` and `packages: write`. setup-node creates runtime authentication
configuration reading `NODE_AUTH_TOKEN`; the publish step supplies it. Dependency
installation and validation do not receive this environment variable.

`repository.url` links the npm package to `Mosaique-Evenements-Inc/mosaique-ui`.
For first publication, verify organization policy allows package creation and
that repository Actions may write packages. Packages start private by default;
inspect visibility and repository permission inheritance after publication.
`private: false` in package.json permits publishing; it does not make the registry
package public.

In the package settings, grant `mosaique-web` read access under **Manage Actions
access**. Same organization membership alone does not establish this grant.
Where inheritance is enabled, verify linked-repository permissions; do not assume
they grant a different consumer repository access. Web Actions can then use its
own `GITHUB_TOKEN` with `contents: read` and `packages: read`.

Local developers use a personal access token (classic) with `read:packages` to
install, or `write:packages` and appropriate package permissions to publish.
Authorize SSO if the organization requires it. A fine-grained PAT is not the
documented GitHub Packages npm authentication path. External deployment services
without a GitHub Actions token need a read-only PAT supplied through their secret
environment configuration. Do not create one as part of EP-06.

For local commands, supply `NODE_AUTH_TOKEN` through a secret manager and point
`NPM_CONFIG_USERCONFIG` at an external, ephemeral npm configuration containing
only this literal environment reference:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Do not expand the secret into a file, commit the file, print the environment, or
pass the credential as a command-line argument. Delete the temporary config and
unset the environment after use. Existing valid runtime authentication may be
reused. EP-06 does not modify `~/.npmrc` or store any credentials.

## Release Order

1. Review the UI foundation and release-preparation diffs; retain the validated
   local tarball as fallback. Commit/push UI only after explicit authorization.
2. On GitHub, verify publisher permissions, linked repository, and authenticated
   version history. Confirm `0.1.0` is available before authorizing publication.
3. Dispatch `Publish package` on `main`, entering exactly `0.1.0`. It installs with
   the frozen lockfile, runs checks, packs, lists, and publishes that same archive.
   A version mismatch fails; a non-main dispatch is skipped. No push/tag trigger,
   tag creation, automatic versioning, or Changesets is involved.
4. Verify registry name, version, repository, exports, sideEffects and dist
   integrity with `npm view @mosaique-evenements-inc/ui@0.1.0 --json` using read
   authentication. Download/install the registry artifact in an isolated consumer;
   compare its CSS bytes to the approved package and resolve both CSS exports.
5. Grant Web Actions access, then follow Web's `docs/SHARED_FOUNDATION.md` to
   replace only the tarball dependency with exact `0.1.0` and regenerate the lockfile.
6. Test a fresh Web installation without the sibling tarball. Run lint, typecheck,
   build and diff-check, plus targeted Chrome computed-style/interaction checks.
   Commit/push Web only after those checks pass and authorization is given.

## Rollback

- Publication failure: leave Web on its validated tarball. Correct access/config
  and retry only after checking whether the version was actually published.
- Published content is wrong: stop adoption; do not delete/reuse the version as
  the default remedy. Review an authorized corrective patch release separately.
- Registry installation failure: restore the reviewed tarball package.json and
  lockfile pair and retain the matching archive; do not change CSS or auth policy
  to conceal a permissions error.
- Visual regression: stop Web rollout, restore the validated dependency/lockfile
  pair, compare installed CSS bytes and cascade, and resolve the cause before retry.

## References

- [GitHub npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Package access and inheritance](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
- [setup-node authentication](https://github.com/actions/setup-node)
