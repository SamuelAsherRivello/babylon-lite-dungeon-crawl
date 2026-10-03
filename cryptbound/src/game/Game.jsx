import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { abilityCatalog, attributeLabels, createCampaign, createGameSession, effectiveAttributes, resourceState } from "./dungeon.js";
import { describeInventoryDrop } from "./inventory-drag.js";
import { gameZoomPresets } from "../content/world/zoom.js";
import { projectLogEvents } from "./log-policy.js";
import { createAudioManager } from "./audio.js";
import { projectFloatingFeedback, removeFloatingFeedback } from "./floating-feedback.js";
import { getLatestMovement, getMovementKey, getMoveInitialDelay, getMoveRepeatDelay } from "./keyboard-input.js";
import { getMouseMovementFromSelectedCell } from "./mouse-selection.js";
import { readPreferences, readSlot, readSlotSummary, writePreferences, writeSlot } from "./saves.js";
import { BabylonWorld } from "../content/BabylonWorld.jsx";
import { Dialog } from "../ui/Dialog.jsx";
import { Tooltip } from "../ui/Tooltip.jsx";
import { LayoutContext } from "../ui/layout-context.js";
import versionText from "../../../version.txt?raw";

const icons = { health: "♥", stamina: "◈", offense: "⚔", defense: "⛨", mana: "✦", xp: "★" };
function Card({ title, children, className = "" }) { return <section className={"desk_card " + className}><h2>{title}</h2>{children}</section>; }
function ResourceBar({ name, value, gain }) { const fill = Math.max(0, Math.min(100, value.current ?? 0)); const cap = Math.max(0, Math.min(100, value.currentMax ?? 100)); const gainStart = gain ? Math.min(cap, Math.max(0, gain.from / value.currentMax * 100)) : 0; const gainEnd = gain ? Math.min(cap, Math.max(0, gain.to / value.currentMax * 100)) : 0; return <div className={"resource resource_" + name} aria-label={name + ": " + value.current + " of " + value.currentMax}><span>{icons[name]}</span><div className="resource_track"><i style={{ width: Math.min(cap, fill) + "%" }} />{gain && <strong className="resource_gain" style={{ left: gainStart + "%", width: Math.max(0, gainEnd - gainStart) + "%" }} />}<b style={{ left: cap + "%" }} />{name === "xp" && <em>{String(value.level).padStart(2, "0")}</em>}</div></div>; }
const resourceHelp = { health: "Health remaining", stamina: "Stamina for actions", offense: "Attack power", defense: "Reduces incoming damage", mana: "Mana for abilities", xp: "Experience toward the next level" };
export function ResourceList({ campaign, gains = {} }) { const resources = resourceState(campaign); return <div className="resource_list">{["health", "stamina", "offense", "defense", "mana", "xp"].map((name) => <Tooltip key={name} content={resourceHelp[name]}><button type="button" className="resource_tooltip_trigger" aria-label={`${name}: ${resources[name].current} of ${resources[name].currentMax}`}><ResourceBar name={name} value={resources[name]} gain={gains[name]} /></button></Tooltip>)}</div>; }
export function AttributeViewItem({ name, value, baseline }) { const direction = value === baseline ? "" : value > baseline ? " attribute_up" : " attribute_down"; return <div className="attribute_item"><span>{attributeLabels[name]}</span><b className={direction}>{value}</b></div>; }
export function AttributeViewItemList({ campaign, preview = null }) { const attributes = effectiveAttributes(campaign); return <div className="attribute_grid">{[["health", "stamina", "offense", "defense", "mana"], ["vitality", "strength", "luck", "recovery", "agility"]].map((column, i) => <div key={i}>{column.map((name) => <AttributeViewItem key={name} name={name} value={preview?.[name] ?? attributes[name]} baseline={attributes[name]} />)}</div>)}</div>; }
export function AbilityViewItem({ index, ability, disabled, onUse }) { return <div className="ability_position" data-drop-ability={index}><button className={"view_row ability_row " + (disabled ? "disabled" : "")} disabled={disabled || !ability} onClick={onUse}><strong>[{String(index + 1).padStart(2, "0")}]</strong>{ability ? <><i>{ability.icon}</i><span>{ability.title}</span><em>{ability.manaCost}</em></> : <span className="drop_blank" />}</button>{ability && <b className="drag_handle" data-drag-kind="ability" data-drag-index={index} aria-label="Drag ability">⠿</b>}</div>; }
export function AbilityViewItemList({ campaign, dispatch }) { const mana = campaign.player.resources.mana.current; return <div className="view_list">{campaign.player.abilities.map((id, index) => { const ability = abilityCatalog[id]; return <AbilityViewItem key={index} index={index} ability={ability} disabled={Boolean(ability && mana < ability.manaCost)} onUse={() => dispatch({ type: "ability", index })} />; })}</div>; }
function SlotRow({ item, group, index, drag }) { const departure = drag?.source.kind === "slot" && drag.source.group === group && drag.source.index === index; const landing = drag?.destination?.kind === "slot" && drag.destination.group === group && drag.destination.index === index; const dragSource = item ? { "data-drag-kind": "slot", "data-drag-id": item.id, "data-drag-group": group, "data-drag-index": index } : {}; return <button className={["view_row", "slot_row", departure && "drag_departure", landing && "drag_landing"].filter(Boolean).join(" ")} data-drop-group={group} data-drop-index={index} {...dragSource}><strong>{item?.name ?? ""}</strong>{item ? <b className="drag_handle" aria-hidden="true">⠿</b> : <span className="empty_slot" aria-label="Empty slot">+</span>}</button>; }
export function SlotList({ campaign, drag = null }) { return <div className="slot_scroll">{[["Weapons", "weapons"], ["Armor", "armor"]].map(([label, group]) => <div className="slot_group" key={group}><h3>{label}</h3>{campaign.player.equipment[group].map((item, index) => <SlotRow key={index} item={item} group={group} index={index} drag={drag} />)}</div>)}</div>; }
export function InventoryViewItems({ campaign, dispatch, drag = null }) { const landing = drag?.destination?.kind === "inventory"; return <div className={"inventory_scroll" + (landing ? " drag_landing" : "")} data-drop-inventory>{campaign.player.inventory.map((item) => { const departure = drag?.source.kind === "inventory" && drag.source.item.id === item.id; return <button key={item.id} className={["view_row", "inventory_row", departure && "drag_departure"].filter(Boolean).join(" ")} onDoubleClick={() => dispatch({ type: "equip", itemId: item.id, group: item.group, index: 0 })}><span className="drag_handle" data-drag-kind="inventory" data-drag-id={item.id} aria-label={`Drag ${item.name}`}>{item.name}</span><b className="drag_handle" data-drag-kind="inventory" data-drag-id={item.id} aria-label={`Drag ${item.name}`}>⠿</b></button>; })}</div>; }
function SecondaryInfoPanel({ campaign }) { return <aside className="info_panel secondary"><Card title="Minimap"><div className="minimap"><BabylonWorld campaign={campaign} zoom={0.18} minimap /></div></Card><Card title="Quest"><p className="quest_text">{campaign.objective}</p></Card><Card title="Log" className="log_card"><div className="log_scroll">{campaign.log.map((entry) => <p key={entry.id}>{entry.text}</p>)}</div></Card></aside>; }
function PrimaryInfoPanel({ campaign, dispatch, preview, gains, drag }) { return <aside className="info_panel primary"><Card title="Resources"><ResourceList campaign={campaign} gains={gains} /></Card><Card title="Attributes"><AttributeViewItemList campaign={campaign} preview={preview} /></Card><Card title="Abilities"><AbilityViewItemList campaign={campaign} dispatch={dispatch} /></Card><Card title="Slots"><SlotList campaign={campaign} drag={drag} /></Card><Card title={"Inventory " + String(campaign.player.inventory.length).padStart(2, "0") + "/" + String(campaign.player.inventoryCapacity).padStart(2, "0")}><InventoryViewItems campaign={campaign} dispatch={dispatch} drag={drag} /></Card></aside>; }
function MobileControlPanel({ campaign, dispatch, hidden = false }) { return <section className="mobile_controls" hidden={hidden}><div className="arrow_controls">{[["n", "↑"], ["w", "←"], ["s", "↓"], ["e", "→"]].map(([direction, label]) => <button key={direction} onClick={() => dispatch({ type: "move", direction })}>{label}</button>)}</div><div className="mobile_abilities">{[0, 1, 2, 3].map((index) => <button key={index} disabled={!campaign.player.abilities[index] || campaign.player.resources.mana.current < abilityCatalog[campaign.player.abilities[index]]?.manaCost} onClick={() => dispatch({ type: "ability", index })}>{index + 1}</button>)}</div><button className="sneak_button" onClick={() => dispatch({ type: "toggle-sneak" })}>Sneak {campaign.player.sneaking ? "On" : ""}</button></section>; }
function SettingsDialog({ onClose, onReturn, preferences, setPreference, mutedByUrl }) { return <Dialog title="Settings" onClose={onClose}><div className="settings_actions"><div className="audio_settings"><label className="audio_slider"><span>SFX Volume <output>{preferences.sfxVolume}%</output></span><input type="range" min="0" max="100" step="1" value={preferences.sfxVolume} aria-label="SFX volume" aria-valuetext={`${preferences.sfxVolume}%`} onChange={(event) => setPreference({ sfxVolume: Number(event.target.value) })} /></label><label className="audio_slider"><span>Music Volume <output>{preferences.musicVolume}%</output></span><input type="range" min="0" max="100" step="1" value={preferences.musicVolume} aria-label="Music volume" aria-valuetext={`${preferences.musicVolume}%`} onChange={(event) => setPreference({ musicVolume: Number(event.target.value) })} /></label><label className="audio_mute"><input type="checkbox" checked={preferences.muteAll} onChange={(event) => setPreference({ muteAll: event.target.checked })} /> Mute All</label>{mutedByUrl && <span className="audio_mute_notice" role="status">Muted for this page by ?mute=1</span>}</div><button onClick={onReturn}>Save &amp; Return to Main Menu</button><a href="https://github.com/SamuelAsherRivello/babylon-lite-dungeon-crawl" target="_blank" rel="noopener noreferrer">GitHub</a><span>v{versionText.trim().replace(/^version=/, "")}</span></div></Dialog>; }
export function TitleBar({ campaign, preferences, setPreference, onFullscreen, onSettings, fullscreenActual }) { return <header className="titlebar"><span className="game_title">Dungeon Roguelite (DR)</span><span className="world_realm">World of {campaign.world} &nbsp; Level {campaign.floor.level ?? campaign.floor.depth ?? 1}</span><span className="counters">Time: {String(campaign.floor.time).padStart(2, "0")} &nbsp; Keys: {String(campaign.counters.keys).padStart(2, "0")} &nbsp; Gold: {campaign.counters.gold}</span><label aria-label="Zoom">⌕<select value={preferences.zoom} onChange={(event) => setPreference({ zoom: Number(event.target.value) })}>{gameZoomPresets.map((value) => <option key={value} value={value}>{value}x</option>)}</select></label><label aria-label="Camera">▣<select value={preferences.camera} onChange={(event) => setPreference({ camera: event.target.value })}><option value="center">Center</option><option value="deadzone">Deadzone</option><option value="screen">Screen</option></select></label><button aria-label="Fullscreen" aria-pressed={fullscreenActual} onClick={onFullscreen}>⛶</button><button aria-label="Settings" onClick={onSettings}>⚙</button></header>; }
export function StatusBar({ canOverride, orientation, setDeveloperAspect, mobilePanel = "controls", setMobilePanel = () => {} }) { return <footer className="statusbar"><div className="desktop_status">WASD / Arrows: Move, Shift / Right Mouse: Sprint, C: Sneak, 1234: Abilities {canOverride && <button className="dev_settings" onClick={() => setDeveloperAspect(orientation === "landscape" ? "portrait" : "landscape")}>Dev Settings &nbsp; Aspect: {orientation === "landscape" ? "Landscape" : "Portrait"}</button>}</div><div className="mobile_status" role="group" aria-label="Bottom panel"><button type="button" aria-pressed={mobilePanel === "controls"} onClick={() => setMobilePanel("controls")}>Control</button><button type="button" aria-pressed={mobilePanel === "info"} onClick={() => setMobilePanel("info")}>Info</button></div></footer>; }
export function GameScreen({ children, onPointerDown, orientation = "landscape" }) { return <main className="command_desk" data-orientation={orientation} onPointerDown={onPointerDown}>{children}</main>; }
function ItemDragPreview({ drag }) { return drag && <div className="item_drag_preview" style={{ left: drag.x, top: drag.y }} aria-hidden="true">{drag.item.name}</div>; }
function itemDropTarget(target, campaign) { const slot = target?.closest?.("[data-drop-group]"); if (slot) { const group = slot.dataset.dropGroup; const index = Number(slot.dataset.dropIndex); return { destination: { kind: "slot", group, index }, targetItem: campaign.player.equipment[group]?.[index] }; } if (target?.closest?.("[data-drop-inventory]")) return { destination: { kind: "inventory" } }; return null; }

export function Game() {
  const { orientation, canOverride, setDeveloperAspect } = useContext(LayoutContext);
  const [summaries, setSummaries] = useState(() => { try { return readSlotSummary(localStorage); } catch { return ["1", "2", "3"].map((slot) => ({ slot, occupied: false })); } });
  const [slot, setSlot] = useState(null); const [campaign, setCampaign] = useState(null); const [settings, setSettings] = useState(false); const [saveError, setSaveError] = useState(""); const [preview, setPreview] = useState(null); const [dragPresentation, setDragPresentation] = useState(null); const [gains, setGains] = useState({}); const [floatingFeedback, setFloatingFeedback] = useState([]);
  const [selectedGridSpot, setSelectedGridSpot] = useState(null); const [mobilePanel, setMobilePanel] = useState("controls");
  const gainTimers = useRef(new Map());
  const floatingTimers = useRef(new Map());
  useEffect(() => () => { floatingTimers.current.forEach(clearTimeout); floatingTimers.current.clear(); }, []);
  const [preferences, setPreferences] = useState(() => { try { return readPreferences(localStorage); } catch { return { zoom: 1, camera: "center", fullscreenDesired: false, sfxVolume: 80, musicVolume: 20, muteAll: false }; } });
  const [audio] = useState(() => createAudioManager({ search: window.location.search }));
  useEffect(() => { audio.setPreferences(preferences); }, [audio, preferences]);
  useEffect(() => { const startMusic = () => audio.startMusic(); window.addEventListener("pointerdown", startMusic); window.addEventListener("keydown", startMusic); return () => { window.removeEventListener("pointerdown", startMusic); window.removeEventListener("keydown", startMusic); }; }, [audio]);
  const [fullscreenActual, setFullscreenActual] = useState(() => Boolean(document.fullscreenElement));
  const fullscreenStateRef = useRef(Boolean(document.fullscreenElement));
  const sessionRef = useRef(null);
  const pointerDragRef = useRef(null);
  const dispatch = useCallback((action) => sessionRef.current?.dispatch(action), []);
  const moveTimer = useRef(null);
  const heldMovements = useRef(new Map());
  const heldShift = useRef(new Set());
  const mouseMovement = useRef(null);
  const previousSelectedGridSpot = useRef(null);
  const activeMovement = useRef(null);
  const returnToMainMenu = useCallback(() => {
    if (moveTimer.current) { clearTimeout(moveTimer.current); clearInterval(moveTimer.current); moveTimer.current = null; }
    heldMovements.current.clear(); heldShift.current.clear(); mouseMovement.current = null; activeMovement.current = null;
    pointerDragRef.current = null; sessionRef.current = null;
    gainTimers.current.forEach(clearTimeout); gainTimers.current.clear(); setGains({});
    floatingTimers.current.forEach(clearTimeout); floatingTimers.current.clear(); setFloatingFeedback([]);
    setSelectedGridSpot(null); setPreview(null); setDragPresentation(null); setSettings(false); setCampaign(null); setSlot(null);
  }, []);
  const syncMovement = useCallback((immediate = true) => {
    const keyboard = getLatestMovement(heldMovements.current, heldShift.current.size > 0);
    const next = keyboard ?? mouseMovement.current;
    const previous = activeMovement.current;
    const source = keyboard ? "keyboard" : "pointer";
    if (previous?.direction === next?.direction && previous?.sprint === next?.sprint && previous?.source === source) return;
    activeMovement.current = next ? { ...next, source } : null;
    if (moveTimer.current) { clearTimeout(moveTimer.current); clearInterval(moveTimer.current); moveTimer.current = null; }
    if (!next) return;
    if (immediate && previous?.direction !== next.direction) dispatch({ type: "move", direction: next.direction });
    const repeat = () => dispatch({ type: "move", direction: next.direction });
    const scheduleRepeat = (delay) => { moveTimer.current = setTimeout(() => {
      repeat();
      if (activeMovement.current?.source === source && activeMovement.current.direction === next.direction && activeMovement.current.sprint === next.sprint) scheduleRepeat(getMoveRepeatDelay(next.sprint));
    }, delay); };
    scheduleRepeat(getMoveInitialDelay(next.sprint));
  }, [dispatch]);
  useEffect(() => {
    mouseMovement.current = getMouseMovementFromSelectedCell(selectedGridSpot, campaign?.player);
    const selectionChanged = previousSelectedGridSpot.current !== selectedGridSpot;
    previousSelectedGridSpot.current = selectedGridSpot;
    syncMovement(selectionChanged);
  }, [campaign, selectedGridSpot, syncMovement]);
  const setPreference = useCallback((change) => { setPreferences((current) => { const next = { ...current, ...change }; try { writePreferences(localStorage, next); } catch { /* session fallback */ } return next; }); }, []);
  const stepZoom = useCallback((step) => { setPreferences((current) => { const index = gameZoomPresets.indexOf(current.zoom); const zoom = gameZoomPresets[Math.max(0, Math.min(gameZoomPresets.length - 1, index + step))]; const next = { ...current, zoom }; try { writePreferences(localStorage, next); } catch { /* session fallback */ } return next; }); }, []);
  const toggleFullscreen = useCallback(async () => { const desired = !document.fullscreenElement; setPreference({ fullscreenDesired: desired }); try { if (desired) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { /* browser gesture policy */ } }, [setPreference]);
  useEffect(() => { const sync = () => { const actual = Boolean(document.fullscreenElement); if (fullscreenStateRef.current && !actual) setPreference({ fullscreenDesired: false }); fullscreenStateRef.current = actual; setFullscreenActual(actual); }; document.addEventListener("fullscreenchange", sync); sync(); return () => document.removeEventListener("fullscreenchange", sync); }, [setPreference]);
  const cancelPointerDrag = useCallback(() => { pointerDragRef.current = null; setPreview(null); setDragPresentation(null); }, []);
  const handlePointerDown = useCallback((event) => {
    const handle = event.target.closest?.("[data-drag-kind]");
    if (!handle || event.button !== 0) return;
    const kind = handle.dataset.dragKind; const id = handle.dataset.dragId;
    const item = kind === "ability" ? { abilityId: campaign.player.abilities[Number(handle.dataset.dragIndex)] } : campaign.player.inventory.find((entry) => entry.id === id) ?? [...campaign.player.equipment.weapons, ...campaign.player.equipment.armor].find((entry) => entry?.id === id);
    if (!item) return;
    const source = kind === "inventory" ? { kind, item } : { kind, item, group: handle.dataset.dragGroup, index: Number(handle.dataset.dragIndex) };
    handle.setPointerCapture?.(event.pointerId);
    pointerDragRef.current = { pointerId: event.pointerId, source, startX: event.clientX, startY: event.clientY, active: false };
    event.preventDefault();
  }, [campaign]);
  useEffect(() => {
    const move = (event) => {
      const current = pointerDragRef.current; if (!current || event.pointerId !== current.pointerId) return;
      if (!current.active && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 6) return;
      current.active = true;
      const target = document.elementFromPoint(event.clientX, event.clientY); const drop = itemDropTarget(target, campaign); const transfer = drop && describeInventoryDrop(campaign, current.source, drop.destination, drop.targetItem);
      if (current.source.kind === "inventory" || current.source.kind === "slot") { setPreview(transfer?.preview ?? null); setDragPresentation({ source: current.source, item: current.source.item, x: event.clientX, y: event.clientY, destination: transfer?.destination ?? null }); }
      else setPreview(null);
    };
    const finish = (event) => {
      const current = pointerDragRef.current; if (!current || event.pointerId !== current.pointerId) return;
      if (current.active && event.type === "pointerup") {
        const target = document.elementFromPoint(event.clientX, event.clientY); const drop = itemDropTarget(target, campaign); const transfer = drop && describeInventoryDrop(campaign, current.source, drop.destination, drop.targetItem);
        const ability = target?.closest?.("[data-drop-ability]"); let action = transfer?.action ?? null;
        if (!action && ability && current.source.kind === "ability") { const to = Number(ability.dataset.dropAbility); if (current.source.index !== to) action = { type: "assign-ability", from: current.source.index, to }; }
        if (action) { const result = dispatch(action); audio.playDropResult(Boolean(result?.accepted)); }
        else if (drop?.destination.kind === "slot") audio.playDropResult(false);
      }
      cancelPointerDrag();
    };
    const pointerCancel = () => cancelPointerDrag(); const cancel = (event) => { if (event.key === "Escape") cancelPointerDrag(); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", finish); window.addEventListener("pointercancel", pointerCancel); window.addEventListener("keydown", cancel);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", pointerCancel); window.removeEventListener("keydown", cancel); };
  }, [audio, campaign, cancelPointerDrag, dispatch]);
  useEffect(() => {
    const editable = (target) => target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']"));
    const clearHeldInput = () => { heldMovements.current.clear(); heldShift.current.clear(); syncMovement(); };
    const down = (event) => {
      if (settings || editable(event.target)) return;
      const movement = getMovementKey(event);
      if (movement) { event.preventDefault(); if (!heldMovements.current.has(movement.code)) { heldMovements.current.set(movement.code, movement); syncMovement(); } return; }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") { event.preventDefault(); const oldSprint = heldShift.current.size > 0; heldShift.current.add(event.code); if (!oldSprint) syncMovement(false); return; }
      if (!event.repeat && /^Digit[1-4]$/.test(event.code || "")) { event.preventDefault(); dispatch({ type: "ability", index: Number(event.code.slice(-1)) - 1 }); }
      else if (!event.repeat && /^[1-4]$/.test(event.key)) { event.preventDefault(); dispatch({ type: "ability", index: Number(event.key) - 1 }); }
      else if (!event.repeat && (event.code === "KeyC" || event.key.toLowerCase() === "c")) { event.preventDefault(); dispatch({ type: "toggle-sneak" }); }
    };
    const up = (event) => {
      if (getMovementKey(event)) { const { code } = getMovementKey(event); if (heldMovements.current.delete(code)) syncMovement(); }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") { const oldSprint = heldShift.current.size > 0; heldShift.current.delete(event.code); if (oldSprint !== (heldShift.current.size > 0)) syncMovement(false); }
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up); window.addEventListener("blur", clearHeldInput);
    if (settings) clearHeldInput();
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("blur", clearHeldInput); clearHeldInput(); };
  }, [dispatch, settings, syncMovement]);
  const begin = (id) => { let existing = null; try { existing = readSlot(localStorage, id); } catch { setSaveError("This saved game is unavailable. Its data was left unchanged."); setSummaries(readSlotSummary(localStorage)); return; } floatingTimers.current.forEach(clearTimeout); floatingTimers.current.clear(); setFloatingFeedback([]); setSelectedGridSpot(null); if (preferences.fullscreenDesired && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); const initial = existing ?? createCampaign(); const session = createGameSession(initial, { onCommit: (result) => { try { writeSlot(localStorage, id, result.state); setSummaries(readSlotSummary(localStorage)); setSaveError(""); } catch (error) { setSaveError("Saving is unavailable in this browser session."); session.publish("campaign.save.failed", { message: error.message }); } } }); session.subscribe((result) => { if (!result.accepted && !result.system) return; audio.playEvents(result.events); result.state.log = projectLogEvents(result.state.log, result.events); const feedback = projectFloatingFeedback(result.events); if (feedback.length) { setFloatingFeedback((current) => [...current, ...feedback].slice(-24)); for (const effect of feedback) { const timer = setTimeout(() => { setFloatingFeedback((current) => removeFloatingFeedback(current, effect.id)); floatingTimers.current.delete(effect.id); }, effect.duration); floatingTimers.current.set(effect.id, timer); } } for (const event of result.events) { const facts = event.facts; if ((event.type === "resource.changed" && facts.current > facts.previous) || (event.type === "xp.gained" && facts.current > facts.previous)) { const name = event.type === "xp.gained" ? "xp" : facts.resource; setGains((current) => ({ ...current, [name]: { from: facts.previous, to: facts.current, max: facts.currentMax ?? initial.progression.attributes[name] ?? 100 } })); clearTimeout(gainTimers.current.get(name)); gainTimers.current.set(name, setTimeout(() => setGains((current) => { const next = { ...current }; delete next[name]; return next; }), 420)); } } if (result.events.some((event) => event.type === "player.died")) { returnToMainMenu(); return; } setCampaign(result.state); }); sessionRef.current = session; setSlot(id); setCampaign(initial); };
  if (!campaign) return <main className="saved_games"><h1>Dungeon Roguelite (DR)</h1><h2>3 Saved Games</h2>{summaries.map((entry) => <button key={entry.slot} disabled={entry.invalid} onClick={() => begin(entry.slot)}><b>Saved Game {entry.slot}</b><span>{entry.invalid ? "Unavailable" : entry.occupied ? "Level " + String(entry.level).padStart(2, "0") + " · XP " + String(entry.xpLevel).padStart(2, "0") : "New Game"}</span></button>)}<Tooltip content="Hover an enemy in the dungeon to inspect its portrait and resources."><button type="button" className="tooltip_demo_trigger">Tooltip help</button></Tooltip>{saveError && <p role="alert">{saveError}</p>}</main>;
  return <GameScreen orientation={orientation} onPointerDown={handlePointerDown}>
    <TitleBar campaign={campaign} preferences={preferences} setPreference={setPreference} onFullscreen={toggleFullscreen} onSettings={() => setSettings(true)} fullscreenActual={fullscreenActual} />
    <section className="desk_middle"><section className="game_view"><BabylonWorld campaign={campaign} zoom={preferences.zoom} camera={preferences.camera} mouseInteraction floatingFeedback={floatingFeedback} selectedCell={selectedGridSpot} onSelectedCellChange={setSelectedGridSpot} onZoom={stepZoom} /></section><div className="desktop_info"><SecondaryInfoPanel campaign={campaign} /><PrimaryInfoPanel campaign={campaign} dispatch={dispatch} preview={preview} gains={gains} drag={dragPresentation} /></div></section>
    <StatusBar canOverride={canOverride} orientation={orientation} setDeveloperAspect={setDeveloperAspect} mobilePanel={mobilePanel} setMobilePanel={setMobilePanel} />
    <section className="mobile_bottom"><MobileControlPanel campaign={campaign} dispatch={dispatch} hidden={mobilePanel !== "controls"} /><div className="mobile_info" hidden={mobilePanel !== "info"}><SecondaryInfoPanel campaign={campaign} /><PrimaryInfoPanel campaign={campaign} dispatch={dispatch} preview={preview} gains={gains} drag={dragPresentation} /></div></section>
    <ItemDragPreview drag={dragPresentation} />
    {canOverride && orientation === "portrait" && <button className="dev_aspect_return" onClick={() => setDeveloperAspect("landscape")}>Dev: Return to Landscape</button>}
    {saveError && <div className="save_error">{saveError}</div>}
    {settings && <SettingsDialog onClose={() => setSettings(false)} onReturn={() => { try { writeSlot(localStorage, slot, campaign); setSaveError(""); } catch { setSaveError("Saving is unavailable in this browser session."); } returnToMainMenu(); }} preferences={preferences} setPreference={setPreference} mutedByUrl={audio.hardMuted} />}
  </GameScreen>;
}
