function overlaps(a, b) {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}

/** Find the valid grid candidate closest to the hovered cell center. */
export function findWorldTooltipPosition(viewport, tooltip, protectedRects, gap = 8) {
  if (tooltip.width > viewport.width - gap * 2 || tooltip.height > viewport.height - gap * 2) return null;
  const centerX = (rect) => rect.left + rect.width / 2;
  const centerY = (rect) => rect.top + rect.height / 2;
  const hovered = protectedRects[0];
  const step = Math.max(8, Math.min(tooltip.width, tooltip.height) / 2);
  const candidates = [];
  for (let y = viewport.top + gap; y + tooltip.height <= viewport.bottom - gap; y += step) for (let x = viewport.left + gap; x + tooltip.width <= viewport.right - gap; x += step) {
    const rect = { left: x, top: y, width: tooltip.width, height: tooltip.height };
    if (protectedRects.some((protectedRect) => overlaps(rect, protectedRect))) continue;
    candidates.push({ left: x, top: y, distance: hovered ? Math.hypot(centerX(rect) - centerX(hovered), centerY(rect) - centerY(hovered)) : 0 });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.top - b.top || a.left - b.left);
  return candidates[0] ? { left: candidates[0].left - viewport.left, top: candidates[0].top - viewport.top } : null;
}
