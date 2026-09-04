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

Version 0.2.0 adds typography, status and control tokens, plus opt-in recipes.
It is prepared locally and not yet published. See the
[0.2.0 release notes](docs/RELEASE-0.2.0.md) for scope and migration guidance.
All seven original token files and foundation.css remain byte-identical.
New token names do not replace Web's existing typography aliases.

Deferred: font delivery, React/Astro components, complex surfaces, cinematic
recipes, Web layouts, tables, carousels, dropdowns, tabs and pagination.

## UI-09 Typography

`--primitive-font-sans` defines Montserrat followed by ui-sans-serif, system-ui,
-apple-system, BlinkMacSystemFont, Segoe UI and sans-serif. The consumer owns
font delivery. No font files, remote requests or @font-face rules are provided.
Montserrat is not guaranteed to render until the consumer supplies it.
Cinzel and editorial/display scales remain Web-owned.

The `--type-{role}-{font-family,size,weight,line-height,letter-spacing}` roles
reference a small `--primitive-type-*` scale. These are values, not global styles.

| Role    | Size      | Weight | Line height | Tracking |
| ------- | --------- | ------ | ----------- | -------- |
| body    | 1rem      | 400    | 1.6         | 0        |
| label   | 0.875rem  | 500    | 1.5         | 0        |
| caption | 0.8125rem | 500    | 1.4         | 0        |
| control | 1rem      | 500    | 1.5         | 0        |

Body/caption retain the small-text Web contract; labels use the existing 14px UI
vocabulary with roomier leading. Controls use 16px for readable form text.
This does not migrate Admin's headings or Web's navigation/CTA typography.

## UI-09 Status Colors

`--color-status-{success,warning,error,info}-{foreground,background,border}`
provides opaque, paired light-surface colors. Muted botanical green, ochre related
to the tan accent, dusty red and mineral blue distinguish meaning while keeping
the palette restrained. These are intentional additions, not inferred business
states. Use explicit text/semantics as well as color. No dark theme is implied.

| Status  | Foreground | Background | Border  | Text/background | Border/background |
| ------- | ---------- | ---------- | ------- | --------------- | ----------------- |
| success | #285943    | #edf4ef    | #547963 | 7.23:1          | 4.38:1            |
| warning | #71501d    | #faf2e2    | #92703e | 6.58:1          | 4.09:1            |
| error   | #873c3c    | #f8eded    | #a45b5b | 6.68:1          | 4.34:1            |
| info    | #36576b    | #edf2f6    | #607d90 | 6.82:1          | 3.85:1            |

`pnpm check` computes unrounded sRGB relative-luminance ratios, requiring 4.5:1
for text and 3:1 for borders. It also checks status text/borders on existing white
and cream surfaces. Thresholds follow [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
Custom surface/theme overrides require new contrast checks.

## UI-09 Density

`--control-{compact,standard,comfortable}-{min-height,padding-inline,padding-block}`
defines geometry only. At a 16px root:

| Density     | Minimum height | Inline padding | Block padding |
| ----------- | -------------- | -------------- | ------------- |
| compact     | 40px           | 12px           | 4px           |
| standard    | 48px           | 16px           | 8px           |
| comfortable | 60px           | 24px           | 12px          |

Standard matches current Admin minimum height; comfortable matches Web inputs.
Compact is the approved smaller product density, not an automatic migration.
The sole new geometric value is 3.75rem for comfortable; all other values reuse
spacing tokens. Heights are minimums and grow for wrapped text/zoom. Density
does not select color, family, radius or width. `--control-radius` independently
aliases the existing small radius. Target width/spacing remain consumer-owned;
compact is not a blanket guarantee of touch accessibility.

## UI-09 Opt-In Recipes

```css
@import "@mosaique-evenements-inc/ui/recipes.css";
```

This third entrypoint imports tokens and all three small recipes in
`mosaique.recipes`. No foundation reset is imported. Existing tokens.css and
foundation.css never import recipes. Elements without `mq-*` classes are not
styled, even with recipes imported. Consumer unlayered styles win over recipes;
establish layer order explicitly when combining with Tailwind utilities.

UI-10 verified this prelude before imports when utilities should override recipes:

```css
@layer theme, base, mosaique, components, utilities;
@import "tailwindcss";
@import "@mosaique-evenements-inc/ui/recipes.css";
```

Without an explicit order, a recipe layer first encountered after utilities wins
over those utilities. HTML class order does not change CSS layer precedence.

```html
<button
  class="mq-control mq-button"
  data-variant="primary"
  data-density="standard"
  type="button"
>
  Save
</button>
<a class="mq-control mq-button" data-variant="outline" href="/account"
  >Account</a
>
<div class="mq-field">
  <label class="mq-label" for="email">Email</label>
  <input
    class="mq-control mq-input"
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-help email-error"
  />
  <p class="mq-help" id="email-help">Use your contact email.</p>
  <p class="mq-error" id="email-error">Error: enter a valid email.</p>
</div>
```

- `mq-control`: box model, control typography, density and shared focus/motion.
  Standard is the default; set data-density on each control, not its container.
- `mq-button`: compose with mq-control. Primary (default), outline and ghost;
  no redundant secondary, destructive palette, icons or spinner. Hover and active
  are suppressed for disabled/pending. aria-pressed=true adds an inset border.
- `mq-input`: compose with mq-control for text-like inputs/native selects.
  Not intended for checkbox/radio/range/color/file/hidden inputs. Native select
  behavior/arrow is preserved; this is not a custom Select implementation.
- `mq-field`, `mq-label`, `mq-help`, `mq-error`: optional composition and roles;
  no application width. Add mq-textarea to mq-control mq-input only on textarea
  for the separate 8rem minimum and vertical resizing.

Recipes are designed for existing light white/cream surfaces. Ghost and helper
text need consumer contrast review on other backgrounds. There is no implicit
dark theme. Invalid inputs use error background/border; error text remains
explicit. Readonly remains selectable/focusable and uses a dashed border.
Disabled has a dashed border and opaque neutral surface, with text contrast
6.47:1. Pending uses aria-busy=true, a progress cursor and no loading animation.

CSS does not disable actions. Use native disabled on buttons/inputs where needed;
aria-disabled alone does not prevent link navigation, clicks or keyboard actions.
Consumers must suppress handlers and, for unavailable links, remove href and
choose appropriate focus/role semantics. Pending does not automatically disable:
prevent duplicate submission in application logic. Keep readable pending text
or an appropriate live announcement. Use real labels, descriptions, error text,
aria-invalid and aria-describedby; ARIA and validation are not inferred by CSS.
Do not use button markup for navigation or links for non-navigation actions.

Focus uses the existing 2px ring and 3px offset; no outline is removed. All
transitions reuse the existing fast/easing aliases, including reduced motion.
No second reduced-motion implementation or cinematic transition is introduced.
Browser native controls, forced colors, theme overrides, target widths and final
keyboard/assistive-technology behavior still need consumer validation.

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

## UI-09 Validation Record

The isolated plain HTML consumer passed 322 assertions at 1440x900 and 390x844.
All 71 legacy computed custom properties matched, as did standard computed
properties of representative text, button, input and box elements under the
old/new tokens and foundation imports. Unclassed elements also remained
unchanged with recipes imported. Density minimums measured 40/48/60px.
The button matrix covered three variants, three densities and eight states;
minimum measured text contrast was 6.47:1. Focus contrast measured 6.22:1 on
white and 5.53:1 on cream. Field, native select, link and textarea checks passed.

Hover/active were forced through equivalent fixture-only selectors; reduced
motion was tested by forcing the existing media condition in a served test copy
(computed transition 1ms). No OS preference was changed. These are CSS-state
tests, not a claim of complete pointer/assistive-technology or real-consumer
validation. Font delivery and Web/Admin migration remain outside UI-09.
The temporary fixture was removed after testing. The inspected archive had
18 files: package metadata, README and 16 CSS files, with all imports resolving.

## Publishing

The 0.1.0 publication is established; 0.2.0 is prepared but not yet published.
Publication requires separate authorization after diff review and commit/push.
The manual `Publish package` workflow
validates and packs the approved version on `main`, then publishes that exact
archive to GitHub Packages. It runs only after an explicit workflow dispatch;
pushes and pull requests never publish. No version or GitHub release is created.
An authenticated, paginated history check refuses an existing version before
packing/publishing. API/authentication failures stop the workflow; they are not
treated as evidence that a version is available.

The versioned `.npmrc` routes only the organization scope. Authentication is
injected at runtime, never stored in the repository. The publish step uses
`GITHUB_TOKEN` as `NODE_AUTH_TOKEN` with `packages: write` and `contents: read`.

Release operators must verify package access and version availability before
dispatch. The repository's `docs/RELEASE.md` documents authentication, consumer
access, publication order, registry validation, and rollback.
