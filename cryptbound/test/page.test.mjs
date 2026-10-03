import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import viteConfig from '../../vite.config.js';
import { aspectRatioPresets, classifyPlatform, defaultLayout, fitViewport, layoutForPlatform, validateLayout } from '../src/ui/layout.js';

test('builds Cryptbound from its GitHub Pages base', () => {
  assert.equal(viteConfig.root, 'cryptbound'); assert.equal(viteConfig.base, '/babylon-lite-dungeon-crawl/');
});
test('fits both landscape and portrait command-desk surfaces', () => {
  assert.equal(defaultLayout.label, '16:9'); assert.equal(aspectRatioPresets.portrait.label, '9:16');
  for (const layout of [defaultLayout, { orientation: 'portrait', ...aspectRatioPresets.portrait }]) { const fitted = fitViewport(900, 900, layout); assert.ok(fitted.width <= 900 && fitted.height <= 900); assert.equal(fitted.x * 2 + fitted.width, 900); }
  assert.throws(() => validateLayout({ orientation: 'portrait', width: 16, height: 9 }));
});
test('selects aspect by mobile platform signal with a PC-only developer preview override', () => {
  assert.equal(classifyPlatform({ userAgentDataMobile: false, userAgent: 'iPhone' }), 'mobile');
  assert.equal(classifyPlatform({ userAgentDataMobile: false, userAgent: 'Windows NT 10.0' }), 'pc');
  assert.equal(classifyPlatform({ userAgentDataMobile: true, userAgent: 'Desktop' }), 'mobile');
  assert.equal(classifyPlatform({ userAgent: 'Mozilla/5.0 (Linux; Android 14) Mobile' }), 'mobile');
  assert.equal(layoutForPlatform('pc').orientation, 'landscape');
  assert.equal(layoutForPlatform('pc', 'portrait').orientation, 'portrait');
  assert.equal(layoutForPlatform('mobile', 'landscape').orientation, 'portrait');
});
test('keeps the developer aspect override behind the development build flag', async () => {
  const app = await readFile(new URL('../src/ui/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /platform === "pc" && import\.meta\.env\.DEV/);
  assert.match(app, /layoutForPlatform\(platform, canOverride \? developerAspect : null\)/);
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  assert.match(game, /canOverride && orientation === "portrait"/);
  assert.match(game, /setDeveloperAspect\("landscape"\)/);
  assert.match(game, /className="command_desk" data-orientation=\{orientation\}/);
  const css = await readFile(new URL('../src/ui/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.command_desk\[data-orientation="portrait"\]/);
  assert.doesNotMatch(css, /@media\s*\(max-aspect-ratio|@container\s*\(max-aspect-ratio/);
});
test('removes fitted gutters while the browser surface is fullscreen', async () => {
  const surface = await readFile(new URL('../src/ui/BrowserSurface.jsx', import.meta.url), 'utf8');
  assert.match(surface, /fullscreen \? rectangle\(0, 0, size\.width, size\.height\)/);
  assert.match(surface, /fullscreenchange/);
  assert.doesNotMatch(surface, /size\.height > size\.width/);
});
test('uses a command desk and removes template corner units', async () => {
  const [game, app, css] = await Promise.all(['src/game/Game.jsx', 'src/ui/App.jsx', 'src/ui/style.css'].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.match(game, /PrimaryInfoPanel/); assert.match(game, /SecondaryInfoPanel/); assert.match(game, /3 Saved Games/); assert.match(game, /Dev Settings/);
  assert.match(game, /className="titlebar_left"/); assert.match(game, /className="titlebar_right"/); assert.match(game, /World: 1/);
  assert.doesNotMatch(app, /AppCorner/); assert.match(css, /mobile_controls/);
  assert.match(css, /grid-template-rows:4% 92% 4%/); assert.match(css, /grid-template-rows:4% 46% 4% 46%/);
  assert.match(css, /grid-template-columns:minmax\(0,56%\) minmax\(0,44%\)/);
  assert.match(css, /align-items:center/);
});
test('returns to the saved-game menu when a player death event is committed', async () => {
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  assert.match(game, /event\.type === "player\.died"/); assert.match(game, /returnToMainMenu\(\); return;/);
});
test('exposes independent persisted SFX and Music controls in Settings', async () => {
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  const saves = await readFile(new URL('../src/game/saves.js', import.meta.url), 'utf8');
  assert.match(game, /aria-label="SFX volume"/); assert.match(game, /aria-label="Music volume"/); assert.match(game, /Mute All/);
  assert.match(game, /mutedByUrl=\{audio\.hardMuted\}/); assert.match(saves, /sfxVolume/); assert.match(saves, /musicVolume/);
});
test('uses the inventory grabber as a cue while the whole row is draggable', async () => {
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  assert.match(game, /function SlotItem/);
  assert.match(game, /<SlotItem key=\{item\.id\} type="inventory"/);
  assert.match(game, /"data-drag-kind": "inventory", "data-drag-id": item\.id/);
  assert.match(game, /"aria-label": `Drag \$\{item\.name\}`/);
  assert.match(game, /\{\.\.\.dropTarget\} \{\.\.\.dragSource\}/);
  const css = await readFile(new URL('../src/ui/style.css', import.meta.url), 'utf8');
  assert.match(css, /\.slot_item\[data-drag-kind\]\{cursor:grab/);
});
test('makes equipment rows draggable and droppable everywhere', async () => {
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  assert.match(game, /function EquipmentItem/);
  assert.match(game, /"data-drag-kind": "slot", "data-drag-id": item\.id/);
  assert.match(game, /dropTarget=\{\{ "data-drop-group": group, "data-drop-index": index \}\}/);
  assert.doesNotMatch(game, /dragWholeRow/);
});
test('uses SlotItem for vertically aligned abilities and equipment', async () => {
  const [game, css] = await Promise.all(['src/game/Game.jsx', 'src/ui/style.css'].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.match(game, /<SlotItem type="ability" number=\{index\}/);
  assert.match(game, /accentColor="#c0aaff"/);
  assert.match(game, /Card title="Equipment"/);
  assert.match(game, /<EquipmentItem key=\{index\}/);
  assert.match(css, /\.slot_item \{[^}]*align-items:center/);
  assert.match(css, /\.slot_item_number,\.slot_item_icon \{ color:var\(--slot-accent-color,#c6b994\)/);
  assert.doesNotMatch(css, /\.slot_item--ability \{/);
});
test('centers an empty equipment slot marker', async () => {
  const [game, css] = await Promise.all(['src/game/Game.jsx', 'src/ui/style.css'].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.match(game, /type === "ability" \? "" : "\+"/);
  assert.match(css, /\.slot_item \.empty_slot\{display:grid;flex:1;place-items:center/);
});
test('renders transient item drag feedback without intercepting drops', async () => {
  const [game, css] = await Promise.all(['src/game/Game.jsx', 'src/ui/style.css'].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
  assert.match(game, /describeInventoryDrop/); assert.match(game, /setDragPresentation\(\{ source: current\.source/);
  assert.match(game, /function ItemDragPreview/); assert.match(game, /drag_departure/); assert.match(game, /drag_landing/);
  assert.match(game, /Math\.hypot\(event\.clientX - current\.startX, event\.clientY - current\.startY\) < 6/);
  assert.match(game, /cancelPointerDrag = useCallback\(\(\) => \{ pointerDragRef\.current = null; setPreview\(null\); setDragPresentation\(null\); \}/);
  assert.match(game, /window\.addEventListener\("pointercancel", pointerCancel\)/);
  assert.match(css, /\.item_drag_preview\{[^}]*pointer-events:none/); assert.match(css, /\.drag_departure/); assert.match(css, /\.drag_landing/);
});

test('renders the Stealth stat and level-up chooser from game-rule state', async () => {
  const game = await readFile(new URL('../src/game/Game.jsx', import.meta.url), 'utf8');
  assert.match(game, /\["vitality", "strength", "luck", "recovery", "stealth"\]/);
  assert.match(game, /export function LevelUpChooser/);
  assert.match(game, /choose-upgrade/);
  assert.match(game, /Level \{pending\.level\}: Choose a Stat/);
});
