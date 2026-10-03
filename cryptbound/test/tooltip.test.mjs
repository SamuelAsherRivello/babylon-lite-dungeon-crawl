import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { findTooltipPosition } from "../src/ui/tooltip-position.js";

test("keeps a UI tooltip inside the viewport when its trigger is near each edge", () => {
  const viewport = { left: 100, top: 50, right: 500, bottom: 350 };
  const tooltip = { width: 120, height: 40 };
  const triggers = [
    { left: 110, top: 60, right: 140, bottom: 80 },
    { left: 450, top: 60, right: 480, bottom: 80 },
    { left: 110, top: 310, right: 140, bottom: 330 },
    { left: 450, top: 310, right: 480, bottom: 330 },
  ];
  for (const target of triggers) {
    const position = findTooltipPosition(viewport, target, tooltip);
    assert.ok(position.left >= viewport.left + 8);
    assert.ok(position.top >= viewport.top + 8);
    assert.ok(position.left + tooltip.width <= viewport.right - 8);
    assert.ok(position.top + tooltip.height <= viewport.bottom - 8);
  }
});

test("prefers a clear position below the trigger and moves above when needed", () => {
  const viewport = { left: 0, top: 0, right: 400, bottom: 300 };
  const tooltip = { width: 100, height: 40 };
  assert.deepEqual(findTooltipPosition(viewport, { left: 20, top: 20, right: 50, bottom: 40 }, tooltip), { left: 20, top: 48 });
  assert.deepEqual(findTooltipPosition(viewport, { left: 20, top: 260, right: 50, bottom: 280 }, tooltip), { left: 20, top: 212 });
});

test("translates a fitted viewport tooltip from viewport coordinates to page coordinates", () => {
  const viewport = { left: 0, top: 0, right: 800, bottom: 450, originLeft: 240, originTop: 120 };
  const target = { left: 560, top: 180, right: 620, bottom: 210 };
  const result = findTooltipPosition(viewport, target, { width: 140, height: 40 });
  assert.deepEqual(result, { left: 320, top: 98 });
});

test("wires UI tooltips to pointer and keyboard focus with accessible descriptions", async () => {
  const [tooltip, game] = await Promise.all([
    readFile(new URL("../src/ui/Tooltip.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/game/Game.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(tooltip, /onPointerEnter:/);
  assert.match(tooltip, /onPointerLeave:/);
  assert.match(tooltip, /onFocus:/);
  assert.match(tooltip, /onBlur:/);
  assert.match(tooltip, /role="tooltip"/);
  assert.match(tooltip, /aria-describedby/);
  assert.match(tooltip, /createPortal\(/);
  assert.match(tooltip, /new ResizeObserver\(update\)/);
  assert.match(game, /<Tooltip key=\{name\} content=\{resourceHelp\[name\]\}/);
  assert.match(game, /className="resource_tooltip_trigger"/);
});

test("renders and measures the in-world tooltip after its React node mounts", async () => {
  const world = await readFile(new URL("../src/content/BabylonWorld.jsx", import.meta.url), "utf8");
  assert.match(world, /<section ref=\{tooltipRef\} className="enemy_world_tooltip"/);
  assert.match(world, /if \(!host \|\| !panel\) return;/);
  assert.match(world, /if \(tooltipRef\.current\) observer\.observe\(tooltipRef\.current\)/);
  assert.match(world, /<h2>PORTRAIT<\/h2>/);
  assert.match(world, /<h2>RESOURCES<\/h2>/);
});
