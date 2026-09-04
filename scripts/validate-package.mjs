import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

const expectedExports = {
  "./tokens.css": "./src/tokens.css",
  "./foundation.css": "./src/foundation.css",
  "./recipes.css": "./src/recipes.css",
};

const expectedFiles = ["src"];
const expectedTokenFiles = [
  "src/tokens/colors.css",
  "src/tokens/spacing.css",
  "src/tokens/shape.css",
  "src/tokens/layers.css",
  "src/tokens/motion.css",
  "src/tokens/layout.css",
  "src/tokens/effects.css",
  "src/tokens/typography.css",
  "src/tokens/status.css",
  "src/tokens/controls.css",
];

const forbiddenPatterns = [
  "--space-28",
  "--space-section",
  "--layout-max-content",
  "--font-weight-regular",
  "--color-background-cinematic",
  "--color-overlay-image",
  "--motion-reveal-distance",
  "--motion-stagger-text-duration",
  "--motion-stagger-interval",
  "--motion-crossfade-duration",
  "--motion-marquee-duration",
  "--layout-grid-columns",
  "--layout-grid-gap",
  "--layout-section-min",
  "--layout-sticky-top",
  "--font-family-",
  "--font-display",
  "--font-body",
  "--text-",
  "@theme",
  "@font-face",
  "Cinzel",
];

const failures = [];

if (JSON.stringify(packageJson.exports) !== JSON.stringify(expectedExports)) {
  failures.push("public exports must match the approved CSS entrypoints");
}
if (packageJson.version !== "0.2.0") {
  failures.push("prepared release version must remain 0.2.0");
}
if (
  Object.keys(packageJson.dependencies ?? {}).length ||
  Object.keys(packageJson.peerDependencies ?? {}).length
) {
  failures.push(
    "CSS-only package must not introduce runtime or peer dependencies",
  );
}

// Freeze the shipped files, including reduced-motion overrides, independently of git.
const legacyHashes = {
  "src/foundation.css":
    "c517869f84e476bf5a201cb3cde59b1df8df3b2705dec9a78efd7a32dc775424",
  "src/tokens/colors.css":
    "69a77da4ac1d02673cdaa22952c8b9e7e8ad326defe0dcbcd9fab4ffda3c387b",
  "src/tokens/effects.css":
    "2853b3732da06ed72631ed5159328c08c9eef5ffe32e9761aed18da0b4424767",
  "src/tokens/layers.css":
    "f22ae645d3c4ec0fc792ade62cac6da117a6cbd047915658d245dfcc51a92ec0",
  "src/tokens/layout.css":
    "1e481118b2f6b68e12c2a55519b238a97ad72ccb1d8fd25bd9f19c0ca8bb9ae3",
  "src/tokens/motion.css":
    "5907feb032ac295ff60f4af233f154c5dbccca61b9a7fbc54690528f980175e8",
  "src/tokens/shape.css":
    "d373f57a3dd1c2f662036dace3b9872458f3c102926c235f0d979c43c10a1ea2",
  "src/tokens/spacing.css":
    "67dbd5751e33391c242d0d28fff0504e4c5b88bc3eeafbd4aa02d0c17b9e69de",
};
for (const [file, hash] of Object.entries(legacyHashes)) {
  if (createHash("sha256").update(readFileSync(file)).digest("hex") !== hash) {
    failures.push(`0.1.0 file changed: ${file}`);
  }
}

if (packageJson.name !== "@mosaique-evenements-inc/ui") {
  failures.push("package name must remain @mosaique-evenements-inc/ui");
}

if (packageJson.private !== false) {
  failures.push("package must be publishable; private must be false");
}

if (JSON.stringify(packageJson.files) !== JSON.stringify(expectedFiles)) {
  failures.push('package files must stay limited to ["src"]');
}

for (const [entrypoint, target] of Object.entries(expectedExports)) {
  if (packageJson.exports?.[entrypoint] !== target) {
    failures.push(`export ${entrypoint} must resolve to ${target}`);
    continue;
  }

  if (!existsSync(path.join(root, target))) {
    failures.push(`export target is missing: ${target}`);
  }
}

for (const tokenFile of expectedTokenFiles) {
  if (!existsSync(path.join(root, tokenFile))) {
    failures.push(`token family file is missing: ${tokenFile}`);
  }
}

if (packageJson.exports?.["."]) {
  failures.push("root export is intentionally absent for the CSS-only V1");
}

if (packageJson.publishConfig?.registry !== "https://npm.pkg.github.com") {
  failures.push("publishConfig.registry must target GitHub Packages");
}

if (JSON.stringify(packageJson.sideEffects) !== JSON.stringify(["**/*.css"])) {
  failures.push('sideEffects must preserve CSS imports: ["**/*.css"]');
}

const tokensCss = readFileSync(path.join(root, "src/tokens.css"), "utf8");
const foundationCss = readFileSync(
  path.join(root, "src/foundation.css"),
  "utf8",
);
const tokenFamilyCss = expectedTokenFiles
  .map((tokenFile) => readFileSync(path.join(root, tokenFile), "utf8"))
  .join("\n");
const recipeFiles = [
  "src/recipes/control.css",
  "src/recipes/button.css",
  "src/recipes/field.css",
];
const runtimeFiles = [
  "src/tokens.css",
  "src/foundation.css",
  "src/recipes.css",
  ...expectedTokenFiles,
  ...recipeFiles,
];
const contractCss = runtimeFiles
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
const actualFiles = readdirSync("src", { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)));
if (actualFiles.some((file) => !runtimeFiles.includes(file)))
  failures.push("unexpected runtime file in src");
for (const file of runtimeFiles) {
  const css = readFileSync(file, "utf8");
  for (const [, target] of css.matchAll(/@import\s+"([^"]+)";/g)) {
    if (
      !target.startsWith("./") ||
      !runtimeFiles.includes(
        path.normalize(path.join(path.dirname(file), target)),
      )
    ) {
      failures.push(`unexpected or unresolved import in ${file}: ${target}`);
    }
  }
  if (/url\s*\(|\/Users\/|[A-Z]:\\|github_pat_|ghp_/i.test(css))
    failures.push(`external asset, local path or credential in ${file}`);
}
const recipesCss = readFileSync("src/recipes.css", "utf8");
for (const [name, css] of [
  ["tokens.css", tokensCss],
  ["recipes.css", recipesCss],
]) {
  if (
    css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@import\s+"\.\/[\w/.-]+\.css";/g, "")
      .trim()
  ) {
    failures.push(`${name} must contain only local imports and comments`);
  }
}
for (const file of ["src/tokens.css", ...recipeFiles]) {
  if (!recipesCss.includes(`@import "./${file.slice(4)}";`))
    failures.push(`recipe import missing: ${file}`);
}
if (/recipes/.test(tokensCss + foundationCss))
  failures.push("legacy entrypoints must not import recipes");
const definitions = new Set(
  [...tokenFamilyCss.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
);
for (const [, name] of tokenFamilyCss.matchAll(/var\((--[\w-]+)/g)) {
  if (!definitions.has(name)) failures.push(`unresolved token alias: ${name}`);
}
const legacyNames = new Set(
  Object.keys(legacyHashes)
    .filter((file) => file.includes("/tokens/"))
    .flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/(--[\w-]+)\s*:/g)].map(
        (match) => match[1],
      ),
    ),
);
for (const file of expectedTokenFiles.filter((file) => !legacyHashes[file])) {
  const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  if (!/^\s*:root\s*\{[^{}]*\}\s*$/.test(css))
    failures.push(`new token family must only declare root tokens: ${file}`);
  const body = css.slice(css.indexOf("{") + 1, css.lastIndexOf("}"));
  if (
    body
      .split(";")
      .some(
        (declaration) =>
          declaration.trim() && !/^\s*--[\w-]+\s*:/.test(declaration),
      )
  )
    failures.push(`non-token property in ${file}`);
  for (const [, name] of css.matchAll(/(--[\w-]+)\s*:/g)) {
    if (legacyNames.has(name))
      failures.push(`new family overrides legacy token: ${name}`);
    if (
      !/^--(?:primitive-(?:font-sans|type-[\w-]+)|type-(?:body|label|caption|control)-[\w-]+|color-status-(?:success|warning|error|info)-(?:foreground|background|border)|control-[\w-]+|color-control-[\w-]+)$/.test(
        name,
      )
    )
      failures.push(`unapproved token: ${name}`);
  }
}
for (const file of recipeFiles) {
  const css = readFileSync(file, "utf8");
  if (!css.startsWith("@layer mosaique.recipes"))
    failures.push(`recipe layer missing: ${file}`);
  if (/(?:^|[},])\s*(?:html\b|body\b|:root\b|\*)/m.test(css))
    failures.push(`global recipe selector: ${file}`);
  for (const selector of css.matchAll(/(?:^|[{}])\s*([^{}]+)\{/g)) {
    if (
      !selector[1].trim().startsWith("@") &&
      selector[1]
        .split(",")
        .some(
          (part) =>
            !part.includes(".mq-") &&
            !part.includes(":") &&
            !part.includes("["),
        )
    )
      failures.push(`unscoped recipe selector: ${file}`);
  }
  if (/prefers-reduced-motion|(?:duration|delay):\s*\d/.test(css))
    failures.push(`recipe must reuse shared motion: ${file}`);
}
const allDefinitions = new Set(
  [...contractCss.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]),
);
for (const [, name] of contractCss.matchAll(/var\((--[\w-]+)/g)) {
  if (!allDefinitions.has(name))
    failures.push(`unresolved CSS reference: ${name}`);
}
for (const role of ["body", "label", "caption", "control"]) {
  for (const concern of [
    "font-family",
    "size",
    "weight",
    "line-height",
    "letter-spacing",
  ]) {
    if (!definitions.has(`--type-${role}-${concern}`))
      failures.push(`missing typography role: ${role}/${concern}`);
  }
}
for (const density of ["compact", "standard", "comfortable"]) {
  for (const concern of ["min-height", "padding-inline", "padding-block"]) {
    if (!definitions.has(`--control-${density}-${concern}`))
      failures.push(`missing density: ${density}/${concern}`);
  }
}

if (tokensCss.includes("foundation.css")) {
  failures.push("tokens.css must not import foundation.css");
}

if (!foundationCss.includes("./tokens.css")) {
  failures.push(
    "foundation.css must import ./tokens.css so it can be consumed independently",
  );
}

for (const tokenFile of expectedTokenFiles) {
  const importPath = `./tokens/${path.basename(tokenFile)}`;

  if (!tokensCss.includes(importPath)) {
    failures.push(`tokens.css must import ${importPath}`);
  }
}

for (const forbiddenPattern of forbiddenPatterns) {
  if (contractCss.includes(forbiddenPattern)) {
    failures.push(
      `forbidden deferred token or directive found: ${forbiddenPattern}`,
    );
  }
}

if (/--[\w-]*(?:cinematic|display|heading)[\w-]*/i.test(contractCss)) {
  failures.push("cinematic and editorial typography tokens belong to Web");
}

if (failures.length > 0) {
  console.error("Package validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Package contract validated.");
await import("./validate-contrast.mjs");
