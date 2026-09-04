# 0.2.0 Release Notes

Status: prepared, not published. Classification: MINOR, additive opt-in CSS API.

## Added

- Montserrat-based shared sans contract with system fallbacks.
- Primitive typography values and body/label/caption/control semantic roles.
- Success/warning/error/info foreground, background and border contracts.
- Compact/standard/comfortable control density (40/48/60px at a 16px root).
- Opt-in control, button and field recipes, including separate textarea geometry.
- `@mosaique-evenements-inc/ui/recipes.css` export. Button variants: primary,
  outline and ghost; state handling reuses shared focus and motion aliases.
- Guards for legacy values, approved families, imports, contents and contrast.

## Unchanged

All original 0.1.0 token names and values remain unchanged: none removed or
renamed. The seven original family files and foundation.css remain byte-identical.
tokens.css now additionally imports root-only token families; it never imports
recipes or applies typography to elements. Existing exports still resolve.
foundation.css still adds only its opt-in universal box-sizing behavior.
Web retains Cinzel/display, cinematic motion and editorial ownership.

## Not Included

React components/runtime, font delivery, tables, dropdowns, carousel, or Web/Admin
migrations. Montserrat is declared, not delivered: consumers must load/provide it.
No font binaries, CDN URLs or @font-face are included. Fallback remains valid.

## Migration

Existing consumers do not need changes until they opt into new contracts.
Both real consumers remain pinned to 0.1.0 during release preparation.

After publication and registry verification, Admin first:

```sh
pnpm add --save-exact @mosaique-evenements-inc/ui@0.2.0
```

After Admin validation, Web:

```sh
pnpm add --save-exact @mosaique-evenements-inc/ui@0.2.0
```

These commands are not authorization to run migrations now. Recipes require
their explicit import and mq-* classes. Tailwind consumers should establish
`@layer theme, base, mosaique, components, utilities;` before imports if utilities
must win. Class order does not replace cascade order. Semantic HTML, ARIA,
pending-action handling and actual font loading remain consumer responsibilities.

## Validation Evidence

UI-10 passed 12 baseline comparisons across Web/Admin at 390/768/1440px, 456
fixture assertions, consumer gates and representative native focus/press/form
checks. No baseline restyling or horizontal overflow was detected. Montserrat
availability was not established; fallback was exercised. Reduced-motion branch
tests forced the media condition in temporary served CSS, not the OS preference.
Those limits remain explicit; this is not a complete assistive-technology audit.

Status text/background contrast: success 7.23:1, warning 6.58:1, error 6.68:1,
info 6.82:1. Border/background contrast: 4.38:1, 4.09:1, 4.34:1, 3.85:1.
The package remains CSS-only with no runtime dependencies.

UI-11 verified the final 0.2.0 archive: 18 files, a clean offline tarball install,
all three exports and internal imports, and package/contrast validators run
against the installed artifact. All 16 CSS files match the UI-10-tested artifact;
the eight frozen legacy files also match the installed registry 0.1.0 package.
Final browser fixtures passed 100 computed-style assertions covering button
variants, density, field states, status foregrounds and motion aliases. Reduced
motion again used a forced media condition, not an OS preference change.
Six local workflow-history cases passed, including rejection of an existing
version and invalid/empty history. The workflow itself was not dispatched.

See [release runbook](RELEASE.md) for approval, publication, verification order
and rollback. Never overwrite 0.2.0 once published; corrections require 0.2.1.
