import { useEffect, useRef, useState } from "react";
import {
  addSprite2D, centerSprite2DView, createEngine, createGridSpriteAtlas, createSprite2DLayer,
  createSpriteRenderer, disposeEngine, disposeSpriteAtlas, disposeSpriteRenderer,
  loadTexture2D, registerSpriteRenderer, releaseTexture, startEngine, updateSprite2D,
} from "@babylonjs/lite";
import { wallFrameAt } from "../game/dungeon.js";
import { pixelPerfectOptions } from "./babylon/config.js";
import { getInitializationMessage } from "./babylon/initialization.js";
import { getRenderResolutionDimensions } from "./babylon/render-resolution.js";

const texturePaths = {
  tiles: `${import.meta.env.BASE_URL}assets/Tilesets/Tileset_Dungeon.png`,
  hero: `${import.meta.env.BASE_URL}assets/Characters/Hero_Warrior/Frames/Idle/Down/00.png`,
  rat: `${import.meta.env.BASE_URL}assets/Enemies/Rat/Frames/Idle/00.png`,
  skeleton: `${import.meta.env.BASE_URL}assets/Enemies/Skeleton warrior/Frames/Idle/Down/00.png`,
  items: `${import.meta.env.BASE_URL}assets/Tilesets/Items_Static.png`,
};
const clear = { r: 0.06, g: 0.05, b: 0.09, a: 1 };

export function BabylonWorld({ campaign, zoom }) {
  const hostRef = useRef(null); const canvasRef = useRef(null); const sceneRef = useRef(null); const latestRef = useRef({ campaign, zoom });
  const [message, setMessage] = useState("Preparing the crypt…");
  latestRef.current = { campaign, zoom };

  useEffect(() => {
    const host = hostRef.current; const canvas = canvasRef.current;
    let cancelled = false; let engine = null; let renderer = null; let atlases = []; let textures = {}; let observers = [];
    const setup = async () => {
      try {
        if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");
        engine = await createEngine(canvas, pixelPerfectOptions.engine);
        if (cancelled) { disposeEngine(engine); engine = null; return; }
        for (const [key, path] of Object.entries(texturePaths)) {
          const texture = await loadTexture2D(engine, path, pixelPerfectOptions.texture);
          if (cancelled) { releaseTexture(texture); return; }
          textures[key] = texture;
        }
        const tileAtlas = createGridSpriteAtlas(textures.tiles, { cellWidthPx: 32, cellHeightPx: 32, columns: 12, rows: 9, pivot: [0.5, 0.5] });
        const actorAtlases = {};
        for (const key of ["hero", "rat", "skeleton"]) actorAtlases[key] = createGridSpriteAtlas(textures[key], { cellWidthPx: 32, cellHeightPx: 32, columns: 1, rows: 1, pivot: [0.5, 0.5] });
        const itemAtlas = createGridSpriteAtlas(textures.items, { cellWidthPx: 32, cellHeightPx: 32, columns: 3, rows: 3, pivot: [0.5, 0.5] });
        atlases = [tileAtlas, ...Object.values(actorAtlases), itemAtlas];
        const tileLayer = createSprite2DLayer(tileAtlas, { pivot: [0.5, 0.5] });
        const actorLayers = Object.fromEntries(Object.entries(actorAtlases).map(([key, atlas]) => [key, createSprite2DLayer(atlas, { pivot: [0.5, 0.5] })]));
        const itemLayer = createSprite2DLayer(itemAtlas, { pivot: [0.5, 0.5] });
        const tileHandles = [];
        for (let y = 0; y < campaign.floor.height; y++) for (let x = 0; x < campaign.floor.width; x++) tileHandles.push(addSprite2D(tileLayer, { positionPx: [x * 32 + 16, y * 32 + 16], sizePx: [32, 32], frame: 26 }));
        const hero = addSprite2D(actorLayers.hero, { positionPx: [16,16], sizePx: [32,32], frame: 0 });
        const actors = { rat: [], skeleton: [] };
        for (const key of Object.keys(actors)) for (let i = 0; i < 40; i++) actors[key].push(addSprite2D(actorLayers[key], { positionPx: [-10000,-10000], sizePx: [32,32], frame: 0 }));
        const items = Array.from({ length: 40 }, (_, i) => addSprite2D(itemLayer, { positionPx: [-10000,-10000], sizePx: [32,32], frame: i % 9 }));
        const viewLayers = [tileLayer, itemLayer, actorLayers.rat, actorLayers.skeleton, actorLayers.hero];
        renderer = createSpriteRenderer(engine, { layers: viewLayers, clear: true, clearValue: clear });
        registerSpriteRenderer(renderer);
        const draw = () => {
          const state = latestRef.current.campaign; const zoomNow = latestRef.current.zoom;
          const preset = getRenderResolutionDimensions(320, 180, zoomNow);
          const scale = preset.width / 320;
          const renderWidth = canvas.width || canvas.clientWidth || host.clientWidth || 320;
          const renderHeight = canvas.height || canvas.clientHeight || host.clientHeight || 180;
          viewLayers.forEach((layer) => {
            layer.view.zoom = scale;
            centerSprite2DView(layer.view, state.player.x * 32 + 16, state.player.y * 32 + 16, renderWidth, renderHeight);
          });
          let index = 0;
          for (let y = 0; y < state.floor.height; y++) for (let x = 0; x < state.floor.width; x++) {
            const frame = state.floor.map[y][x] === 1 ? wallFrameAt(state.floor, x, y) : 26;
            updateSprite2D(tileHandles[index++], { frame });
          }
          updateSprite2D(hero, { positionPx: [state.player.x * 32 + 16, state.player.y * 32 + 16] });
          const byKind = { rat: state.floor.entities.filter((e) => e.kind === "enemy" && e.name !== "Skeleton"), skeleton: state.floor.entities.filter((e) => e.kind === "enemy" && e.name === "Skeleton") };
          for (const key of Object.keys(actors)) actors[key].forEach((sprite, i) => { const actor = byKind[key][i]; updateSprite2D(sprite, { positionPx: actor ? [actor.x * 32 + 16, actor.y * 32 + 16] : [-10000,-10000] }); });
          const pickups = state.floor.entities.filter((e) => e.kind === "item" || e.kind === "chest" || e.kind === "stairs" || e.kind === "discovery");
          items.forEach((sprite, i) => { const entity = pickups[i]; const frame = entity?.kind === "item" ? 2 : entity?.kind === "chest" ? 0 : entity?.kind === "stairs" ? 1 : 8; updateSprite2D(sprite, { frame, positionPx: entity ? [entity.x * 32 + 16, entity.y * 32 + 16] : [-10000,-10000] }); });
        };
        sceneRef.current = { draw };
        draw(); await startEngine(engine);
        if (cancelled) return;
        const observer = new ResizeObserver(draw); observer.observe(host); observers.push(observer);
        window.addEventListener("resize", draw); observers.push({ disconnect: () => window.removeEventListener("resize", draw) });
        setMessage("");
      } catch (error) {
        console.error("Cryptbound Babylon Lite initialization failed:", error);
        if (renderer) { disposeSpriteRenderer(renderer); renderer = null; }
        atlases.forEach((atlas) => disposeSpriteAtlas(atlas)); atlases = [];
        Object.values(textures).forEach((texture) => releaseTexture(texture)); textures = {};
        if (engine) { disposeEngine(engine); engine = null; }
        if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
      }
    };
    queueMicrotask(() => { if (!cancelled) void setup(); });
    return () => {
      cancelled = true; observers.forEach((observer) => observer.disconnect()); sceneRef.current = null;
      if (renderer) disposeSpriteRenderer(renderer); atlases.forEach((atlas) => disposeSpriteAtlas(atlas)); Object.values(textures).forEach((texture) => releaseTexture(texture)); if (engine) disposeEngine(engine);
    };
  }, []);
  useEffect(() => { sceneRef.current?.draw(); }, [campaign, zoom]);
  return <div className="babylon_world" ref={hostRef} data-renderer="babylon-lite" data-content-style="2d"><canvas ref={canvasRef} className="babylon_world_canvas" aria-label="Pixel-perfect dungeon map"/>{message && <div role="status" className="babylon_world_message">{message}</div>}</div>;
}
