import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

const expectedExports = {
  "./tokens.css": "./src/tokens.css",
  "./foundation.css": "./src/foundation.css",
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
];

const failures = [];

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
const contractCss = [tokensCss, foundationCss, tokenFamilyCss].join("\n");

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

if (/--[\w-]*cinematic[\w-]*/i.test(contractCss)) {
  failures.push("cinematic tokens belong to Web, not shared V1");
}

if (failures.length > 0) {
  console.error("Package validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Package contract validated.");
