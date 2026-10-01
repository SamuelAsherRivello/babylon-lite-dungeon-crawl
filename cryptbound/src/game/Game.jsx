import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brace, choosePending, createCampaign, directions, resolveTurn, statLabels } from "./dungeon.js";
import { readSlot, readSlotSummary, writeSlot } from "./saves.js";
import { getRenderResolutionDimensions } from "../content/babylon/render-resolution.js";
import { BabylonWorld } from "../content/BabylonWorld.jsx";

const keys = { w: "n", arrowup: "n", s: "s", arrowdown: "s", a: "w", arrowleft: "w", d: "e", arrowright: "e" };
const dirFromAxes = (x, y) => Object.keys(directions).find((key) => directions[key][0] === x && directions[key][1] === y);

function Dpad({ onMove }) {
  const cells = [["nw","↖"],["n","↑"],["ne","↗"],["w","←"],["brace","◆"],["e","→"],["sw","↙"],["s","↓"],["se","↘"]];
  return <div className="dungeon_dpad" aria-label="Eight-way movement controls">{cells.map(([dir, label]) => <button type="button" key={dir} aria-label={dir === "brace" ? "Brace" : `Move ${dir}`} onClick={() => dir === "brace" ? onMove("brace") : onMove(dir)}>{label}</button>)}</div>;
}

export function Game() {
  const [slots, setSlots] = useState(() => { try { return readSlotSummary(localStorage); } catch { return ["1","2","3"].map((slot) => ({ slot, occupied: false })); } });
  const [slot, setSlot] = useState(null);
  const [state, setState] = useState(null);
  const [saveError, setSaveError] = useState("");
  const held = useRef(new Set());
  const [zoom, setZoom] = useState("native");
  const move = useCallback((dir) => {
    setState((current) => !current ? current : dir === "brace" ? brace(current) : resolveTurn(current, dir));
  }, []);
  useEffect(() => {
    if (!state || !slot) return;
    try { writeSlot(localStorage, slot, state); setSaveError(""); setSlots(readSlotSummary(localStorage)); }
    catch { setSaveError("Saving is unavailable in this browser session. Keep this tab open to retain your run."); }
  }, [state, slot]);
  useEffect(() => {
    let chordTimer = null; let repeatTimer = null;
    const activeDirection = () => {
      const dx = Number(held.current.has("d") || held.current.has("arrowright")) - Number(held.current.has("a") || held.current.has("arrowleft"));
      const dy = Number(held.current.has("s") || held.current.has("arrowdown")) - Number(held.current.has("w") || held.current.has("arrowup"));
      return dx || dy ? dirFromAxes(Math.sign(dx), Math.sign(dy)) : null;
    };
    const step = () => { const dir = activeDirection(); if (dir) move(dir); };
    const down = (event) => {
      const key = event.key.toLowerCase();
      if (!keys[key]) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target?.isContentEditable) return;
      event.preventDefault();
      held.current.add(key);
      if (!event.repeat) {
        clearTimeout(chordTimer);
        chordTimer = setTimeout(() => { chordTimer = null; step(); clearInterval(repeatTimer); repeatTimer = setInterval(step, 145); }, 70);
      }
    };
    const up = (event) => {
      const lastDirection = activeDirection();
      held.current.delete(event.key.toLowerCase());
      if (![...held.current].some((key) => keys[key])) {
        if (chordTimer !== null) { clearTimeout(chordTimer); chordTimer = null; if (lastDirection) move(lastDirection); }
        clearInterval(repeatTimer); repeatTimer = null;
      }
    };
    const blur = () => { held.current.clear(); clearTimeout(chordTimer); clearInterval(repeatTimer); repeatTimer = null; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => { clearTimeout(chordTimer); clearInterval(repeatTimer); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", blur); };
  }, [move]);

  const begin = (id) => {
    let existing = null; try { existing = readSlot(localStorage, id); } catch { /* invalid slot is replaced with a new campaign */ }
    setSlot(id); setState(existing ?? createCampaign());
  };
  const equipment = useMemo(() => Object.entries(state?.player.equipment ?? {}), [state]);
  if (!state) return <main className="cryptbound_menu"><h1>CRYPTBOUND</h1><p>Descend. Learn. Return stronger.</p><div className="save_slots">{slots.map((entry) => <button key={entry.slot} onClick={() => begin(entry.slot)}><b>Delve {entry.slot}</b><span>{entry.invalid ? "Damaged save · start anew" : entry.occupied ? `Floor ${entry.depth} · Level ${entry.level}` : "Empty slot · new campaign"}</span></button>)}</div></main>;
  const renderSize = getRenderResolutionDimensions(320, 180, zoom);
  return <main className="cryptbound_game">
    <header className="game_top"><span>CRYPTBOUND · FLOOR {state.floor.depth}</span><span>TIME: {state.floor.time}</span><span>LV {state.progression.level} · XP {state.progression.xp}/{state.progression.nextXp}</span></header>
    <section className="game_center"><BabylonWorld campaign={state} zoom={zoom}/><aside className="player_panel"><h2>Delver</h2><div className="panel_row"><span>Health</span><b>♥ {state.player.hp}/{state.player.maxHp}</b></div><div className="panel_row"><span>Stamina</span><b>◈ {state.player.stamina}</b></div><h3>Traits</h3>{Object.entries(state.progression.stats).map(([key, value]) => <div className="panel_row" key={key}><span>{statLabels[key]}</span><b>{value}</b></div>)}<h3>Gear</h3>{equipment.map(([key, value]) => <div className="panel_row gear_row" key={key}><span>{key.replace(/([A-Z])/g, " $1")}</span><b>{value?.name ?? "—"}</b></div>)}<Dpad onMove={move}/></aside></section>
    <footer className="game_bottom"><div className="game_message" role="status">{state.message}{saveError && <span className="save_error"> {saveError}</span>}</div><div className="game_controls"><div className="game_options"><label>Zoom <select value={zoom} onChange={(e) => setZoom(e.target.value)}><option value="half">Half · 0.5×</option><option value="native">Native · 1.0×</option><option value="double">Double · 2.0×</option></select></label><span>{renderSize.width}×{renderSize.height} · 2DPixelPerfect</span><button onClick={() => { setState(null); setSlot(null); }}>Save &amp; return to slots</button></div></div></footer>
    {state.pending && <div className="choice_overlay"><section><h2>{state.pending.type === "level" ? "Choose a trait to improve" : "Replace equipped gear?"}</h2>{state.pending.type === "level" ? state.pending.choices.map((key) => <button key={key} onClick={() => setState((s) => choosePending(s, key))}>{statLabels[key]}</button>) : <><p>{state.pending.old.name} → {state.pending.item.name}</p><button onClick={() => setState((s) => choosePending(s, "swap"))}>Swap</button><button onClick={() => setState((s) => choosePending(s, "leave"))}>Leave it</button></>}</section></div>}
  </main>;
}
