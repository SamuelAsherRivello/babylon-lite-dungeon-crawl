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

test("prefers the side opposite the trigger and vertically centers on it", () => {
  const viewport = { left: 0, top: 0, right: 400, bottom: 300 };
  const tooltip = { width: 100, height: 20 };
  assert.deepEqual(findTooltipPosition(viewport, { left: 20, top: 90, right: 50, bottom: 110 }, tooltip), { left: 58, top: 90 });
  assert.deepEqual(findTooltipPosition(viewport, { left: 350, top: 90, right: 380, bottom: 110 }, tooltip), { left: 242, top: 90 });
});

test("keeps a narrow viewport tooltip inside and centers vertically when possible", () => {
  const viewport = { left: 0, top: 0, right: 180, bottom: 200 };
  const position = findTooltipPosition(viewport, { left: 150, top: 75, right: 170, bottom: 95 }, { width: 120, height: 16 });
  assert.deepEqual(position, { left: 22, top: 77 });
});

test("translates a fitted viewport tooltip from viewport coordinates to page coordinates", () => {
  const viewport = { left: 0, top: 0, right: 800, bottom: 450, originLeft: 240, originTop: 120 };
  const target = { left: 560, top: 180, right: 620, bottom: 210 };
  const result = findTooltipPosition(viewport, target, { width: 140, height: 40 });
  assert.deepEqual(result, { left: 388, top: 55 });
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
  assert.match(tooltip, /import \{ createPortal \} from "react-dom"/);
  assert.match(tooltip, /new ResizeObserver\(update\)/);
  assert.match(game, /<Tooltip key=\{name\} content=\{resourceHelp\[name\]\}/);
  assert.match(game, /className="resource_tooltip_trigger"/);
  assert.match(game, /className="card_title_trigger"/);
  assert.match(game, /className="attribute_tooltip_trigger"/);
  assert.match(game, /const cardHelp =/);
  assert.match(game, /const attributeHelp =/);
  assert.match(game, /function abilityHelp\(ability\)/);
  assert.match(game, /function equipmentSlotHelp\(item\)/);
  assert.match(game, /tooltip=\{abilityHelp\(ability\)\}/);
  assert.match(game, /tooltip=\{equipmentSlotHelp\(item\)\}/);
  assert.doesNotMatch(game, /Key \$\{index \+ 1\}|slotName/);
  assert.doesNotMatch(game, /tooltip_demo_trigger|Tooltip help/);
  const css = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /tooltip_demo_trigger/);
  assert.match(game, /<Tooltip content="Show the movement and ability controls\."/);
  assert.match(game, /<Tooltip content="Show resources, attributes, equipment, inventory, quest, and log\."/);
});

test("renders and measures the in-world tooltip after its React node mounts", async () => {
  const world = await readFile(new URL("../src/content/BabylonWorld.jsx", import.meta.url), "utf8");
  assert.match(world, /<section ref=\{tooltipRef\} className="enemy_world_tooltip"/);
  assert.match(world, /if \(!host \|\| !panel\) return;/);
  assert.match(world, /if \(tooltipRef\.current\) observer\.observe\(tooltipRef\.current\)/);
  assert.match(world, /<h2>PORTRAIT<\/h2>/);
  assert.match(world, /<h2>RESOURCES<\/h2>/);
});
