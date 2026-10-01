import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import viteConfig from '../../vite.config.js';
import { defaultLayout, fitViewport, validateLayout } from '../src/ui/layout.js';

test('builds Cryptbound from the renamed app folder at its GitHub Pages base', () => {
  assert.equal(viteConfig.root, 'cryptbound');
  assert.equal(viteConfig.base, '/babylon-lite-dungeon-crawl/');
});

test('keeps a fixed landscape viewport at common surface sizes', () => {
  assert.deepEqual(defaultLayout, { orientation: 'landscape', width: 16, height: 9, label: '16:9' });
  for (const [width, height] of [[1600, 900], [900, 900], [400, 900], [320, 180]]) {
    const fitted = fitViewport(width, height, defaultLayout);
    assert.ok(fitted.width <= width && fitted.height <= height);
    assert.ok(Math.abs(fitted.width / fitted.height - 16 / 9) < 1e-9);
    assert.equal(fitted.x * 2 + fitted.width, width);
    assert.equal(fitted.y * 2 + fitted.height, height);
  }
  assert.throws(() => validateLayout({ orientation: 'portrait', width: 9, height: 16 }), /fixed landscape/);
});

test('keeps the four template corner roles and game content within the viewport', async () => {
  const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  const [app, surface, main, html, css] = await Promise.all([
    read('src/ui/App.jsx'), read('src/ui/BrowserSurface.jsx'), read('src/main.jsx'), read('index.html'), read('src/ui/style.css'),
  ]);
  assert.match(main, /<App content=\{<Content \/>\} \/>/);
  assert.match(html, /Cryptbound — A Medieval Dungeon Roguelite/);
  for (const id of ['content_layer', 'ui_layer', 'viewport', 'browser_surface']) assert.ok(surface.includes(`id="${id}"`));
  for (const position of ['top_left', 'top_right', 'bottom_left', 'bottom_right']) assert.ok(app.includes(`position="${position}"`));
  assert.match(app, /Cryptbound/);
  assert.match(app, /noopener noreferrer/);
  assert.match(css, /data-orientation|dungeon_dpad|babylon_world/);
  assert.doesNotMatch(app, /orientation|portrait/i);
});

test('publishes the demo from the renamed build output', async () => {
  const deploy = await readFile(new URL('../../.github/workflows/deploy-pages.yml', import.meta.url), 'utf8');
  assert.match(deploy, /cp -R cryptbound\/dist\/. _site\//);
  assert.doesNotMatch(deploy, /project-name\/dist/);
});
