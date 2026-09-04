# @mosaique-evenements-inc/ui

Shared visual foundation for Mosaïque frontend applications.

This package is CSS-first and framework agnostic. It currently publishes stable
CSS entrypoints only; there is no JavaScript runtime, component API, or build
step in V1.

## Public Entrypoints

```css
@import "@mosaique-evenements-inc/ui/tokens.css";
```

`tokens.css` is reserved for shared visual contracts expressed as CSS custom
properties. Importing it must not apply resets or document-level styles.

```css
@import "@mosaique-evenements-inc/ui/foundation.css";
```

`foundation.css` is opt-in. It imports `tokens.css` and may apply minimal shared
foundation styles.

## V1 Token Families

- Color primitives, semantic aliases, and focus tokens
- Spacing primitives and micro/component/content/page-gutter aliases
- Shape/radius primitives
- Layer/z-index primitives
- Non-cinematic motion durations and easing aliases
- Max reading layout constraint
- Blur effect primitives

Responsive vocabulary is documented for V1:

| Name | Value |
| ---- | ----- |
| sm   | 40rem |
| md   | 48rem |
| lg   | 64rem |
| xl   | 80rem |
| 2xl  | 96rem |

These breakpoint values are a shared contract, not runtime CSS variables for
media queries.

Deferred: typography, font delivery, React/Astro components, surface recipes,
cinematic motion recipes, Web-specific layout recipes, and component recipes.

## Contract Boundaries

Tokens use unlayered `:root` declarations. Override them with another unlayered
`:root` rule after the package import; a normal declaration inside a consumer
layer cannot override these unlayered defaults. Aliases resolve where they are
defined: overriding a primitive on a descendant does not recompute aliases
inherited from `:root`. Scoped themes must redeclare the affected aliases.

`foundation.css` adds only universal `box-sizing: border-box`, including pseudo
elements, inside `mosaique.foundation`. It is a document-wide opt-in, not an
isolated subtree reset. Tokens alone do not change element box sizing.

Use `--motion-duration-*` aliases for transitions that should respect reduced
motion. Raw `--primitive-duration-*` values remain unchanged. Consumer overrides
must preserve reduced-motion behavior; duration tokens alone do not disable
delays, repeated animations, transforms, or scrolling effects.

Spacing and width tokens are optional values, not automatic application layout
rules. Z-index values order elements within compatible stacking contexts; they
do not override ancestor stacking contexts or the browser top layer. Color role
names do not guarantee contrast for every foreground/background pairing.

The responsive table is the V1 reference. Consumers must mirror its values in
their own media queries and review changes together until a machine-readable
contract is introduced.

Web owns editorial section rhythm, broad marketing/content max-width, and
cinematic motion vocabulary. These contracts are excluded from shared V1 and
remain under `mosaique-web` ownership.

## Package Validation

```sh
pnpm check
pnpm pack --json
```

`pnpm check` verifies formatting and the package contract. `pnpm pack --json`
shows the exact files that would be published.

## Publishing

Publication is prepared, not completed. The manual `Publish package` workflow
validates and packs the approved version on `main`, then publishes that exact
archive to GitHub Packages. It runs only after an explicit workflow dispatch;
pushes and pull requests never publish. No version or GitHub release is created.

The versioned `.npmrc` routes only the organization scope. Authentication is
injected at runtime, never stored in the repository. The publish step uses
`GITHUB_TOKEN` as `NODE_AUTH_TOKEN` with `packages: write` and `contents: read`.

Release operators must verify package access and version availability before
dispatch. The repository's `docs/RELEASE.md` documents authentication, consumer
access, publication order, registry validation, and rollback.
