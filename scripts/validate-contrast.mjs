import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = ["status", "controls"]
  .map((name) => readFileSync(`src/tokens/${name}.css`, "utf8"))
  .join("\n");
const colors = Object.fromEntries(
  [...css.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6});/gi)].map(
    ([, name, value]) => [name, value],
  ),
);
function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i);
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((byte) => parseInt(byte, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function check(name, foreground, background, minimum) {
  const a = luminance(foreground),
    b = luminance(background);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  assert.ok(ratio >= minimum, `${name}: ${ratio} < ${minimum}`);
  return ratio.toFixed(2);
}
for (const status of ["success", "warning", "error", "info"]) {
  const color = (role) => colors[`--color-status-${status}-${role}`];
  const text = check(
    `${status} text`,
    color("foreground"),
    color("background"),
    4.5,
  );
  const border = check(
    `${status} border`,
    color("border"),
    color("background"),
    3,
  );
  for (const surface of ["#ffffff", "#f6f1e8"]) {
    check(`${status} standalone text`, color("foreground"), surface, 4.5);
    check(`${status} outer border`, color("border"), surface, 3);
  }
  console.log(`${status}: text ${text}:1; border ${border}:1`);
}
console.log(
  `disabled text: ${check("disabled", colors["--color-control-disabled-foreground"], colors["--color-control-disabled-background"], 4.5)}:1`,
);
for (const surface of ["#ffffff", "#f6f1e8"])
  check("control border", colors["--color-control-border"], surface, 3);
