/** Translate the selected world cell into the cardinal movement currently needed to reach it. */
export function getMouseMovementFromSelectedCell(selectedCell, player) {
  if (!selectedCell?.pressed) return null;
  const dx = selectedCell.x - player.x;
  const dy = selectedCell.y - player.y;
  if (!dx && !dy) return null;
  const direction = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "e" : "w") : (dy > 0 ? "s" : "n");
  return { direction, sprint: selectedCell.sprint === true };
}
