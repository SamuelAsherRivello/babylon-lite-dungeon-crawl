import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, pixelPerfectOptions } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getLogicalToRenderScale } from '../src/content/babylon/pixel-perfect.js';
import { cycleRenderResolutionPreset, getRenderResolutionDimensions, isRenderResolutionPreset, renderResolutionPresets } from '../src/content/babylon/render-resolution.js';

test('keeps Babylon Lite Pixel Perfect settings and WebGPU-only initialization', () => {
  assert.deepEqual(contentConfig, { renderer: 'babylon-lite', style: '2d' });
  assert.equal(getRenderingPolicy(contentConfig), 'pixel-perfect');
  assert.deepEqual(pixelPerfectOptions.engine, { msaaSamples: 1 });
  assert.equal(pixelPerfectOptions.texture.minFilter, 'nearest');
  assert.equal(pixelPerfectOptions.texture.magFilter, 'nearest');
  assert.equal(pixelPerfectOptions.texture.mipMaps, false);
  assert.equal(pixelPerfectOptions.texture.invertY, false, 'Tiled images keep their authored top row at the top of the game world');
  assert.match(getInitializationMessage(false, new Error('unsupported')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('#47')), /requires WebGPU/);
});

test('offers only Half, Native and Double render resolutions with Native as default', () => {
  assert.deepEqual(renderResolutionPresets, ['half', 'native', 'double']);
  assert.deepEqual(getRenderResolutionDimensions(320, 180), { preset: 'native', width: 320, height: 180, scale: 1 });
  assert.deepEqual(getRenderResolutionDimensions(320, 180, 'half'), { preset: 'half', width: 160, height: 90, scale: 0.5 });
  assert.deepEqual(getRenderResolutionDimensions(320, 180, 'double'), { preset: 'double', width: 640, height: 360, scale: 2 });
  assert.equal(isRenderResolutionPreset('quarter'), false);
  assert.equal(cycleRenderResolutionPreset('native'), 'double');
  assert.equal(getLogicalToRenderScale(640, 360), 2);
});

test('mounts the dungeon in Babylon Lite and follows the player camera', async () => {
  const source = await readFile(new URL('../src/content/BabylonWorld.jsx', import.meta.url), 'utf8');
  assert.match(source, /createEngine\(canvas, pixelPerfectOptions\.engine\)/);
  assert.match(source, /createSpriteRenderer\(engine/);
  assert.match(source, /registerSpriteRenderer\(renderer\)/);
  assert.match(source, /await startEngine\(engine\)/);
  assert.match(source, /centerSprite2DView\(layer\.view, state\.player\.x/);
  assert.match(source, /disposeSpriteRenderer\(renderer\)/);
  assert.match(source, /getInitializationMessage\(Boolean\(navigator\.gpu\), error\)/);
  assert.doesNotMatch(source, /getContext\(["'](?:2d|webgl2?)["']/i);
});

test('declares and retains the provided 32-pixel Tiled dungeon assets', async () => {
  const tileset = await readFile(new URL('../public/assets/Tiled_Examples/Tilesets/Tileset_Dungeon.tsx', import.meta.url), 'utf8');
  const world = await readFile(new URL('../src/content/BabylonWorld.jsx', import.meta.url), 'utf8');
  assert.match(tileset, /tilewidth="32" tileheight="32"/);
  assert.match(tileset, /Tileset_Dungeon\.png/);
  assert.match(world, /cellWidthPx: 32, cellHeightPx: 32, columns: 12, rows: 9/);
  for (const path of [
    '../public/assets/Tilesets/Tileset_Dungeon.png',
    '../public/assets/Characters/Hero_Warrior/Frames/Idle/Down/00.png',
    '../public/assets/Enemies/Rat/Frames/Idle/00.png',
  ]) {
    const bytes = await readFile(new URL(path, import.meta.url));
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});
