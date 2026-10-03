const MOVEMENT_CODES = Object.freeze({ KeyW: "n", KeyA: "w", KeyS: "s", KeyD: "e", ArrowUp: "n", ArrowLeft: "w", ArrowDown: "s", ArrowRight: "e" });

// A deliberate initial delay prevents a held input from skipping several tactical turns.
export const WALK_INITIAL_DELAY = 400;
export const WALK_REPEAT_DELAY = 200;
export const SPRINT_INITIAL_DELAY = 250;
export const SPRINT_REPEAT_DELAY = 125;

export function getMoveInitialDelay(sprint) {
  return sprint ? SPRINT_INITIAL_DELAY : WALK_INITIAL_DELAY;
}

export function getMoveRepeatDelay(sprint) {
  return sprint ? SPRINT_REPEAT_DELAY : WALK_REPEAT_DELAY;
}

export function getMovementKey(event) {
  const code = MOVEMENT_CODES[event.code] ? event.code : event.key === "w" || event.key === "W" ? "KeyW" : event.key === "a" || event.key === "A" ? "KeyA" : event.key === "s" || event.key === "S" ? "KeyS" : event.key === "d" || event.key === "D" ? "KeyD" : event.key === "ArrowUp" ? "ArrowUp" : event.key === "ArrowLeft" ? "ArrowLeft" : event.key === "ArrowDown" ? "ArrowDown" : event.key === "ArrowRight" ? "ArrowRight" : null;
  return code ? { code, direction: MOVEMENT_CODES[code] } : null;
}

export function getLatestMovement(heldMovements, sprintHeld = false) {
  const last = [...heldMovements.values()].at(-1);
  return last ? { direction: last.direction, sprint: sprintHeld } : null;
}
