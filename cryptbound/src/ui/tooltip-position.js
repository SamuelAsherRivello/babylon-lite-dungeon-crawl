export function findTooltipPosition(viewport, target, tooltip, gap = 8) {
  const localTarget = {
    left: target.left - (viewport.originLeft ?? 0),
    right: target.right - (viewport.originLeft ?? 0),
    top: target.top - (viewport.originTop ?? 0),
    bottom: target.bottom - (viewport.originTop ?? 0),
  };
  const candidates = [
    { left: localTarget.left, top: localTarget.bottom + gap },
    { left: localTarget.left, top: localTarget.top - tooltip.height - gap },
    { left: localTarget.right - tooltip.width, top: localTarget.bottom + gap },
    { left: localTarget.right - tooltip.width, top: localTarget.top - tooltip.height - gap },
  ];
  const fits = candidates.find(({ left, top }) => left >= viewport.left && top >= viewport.top && left + tooltip.width <= viewport.right && top + tooltip.height <= viewport.bottom);
  const candidate = fits ?? candidates[0];
  const minimumLeft = viewport.left + gap;
  const maximumLeft = Math.max(minimumLeft, viewport.right - tooltip.width - gap);
  const minimumTop = viewport.top + gap;
  const maximumTop = Math.max(minimumTop, viewport.bottom - tooltip.height - gap);
  return {
    left: Math.max(minimumLeft, Math.min(candidate.left, maximumLeft)),
    top: Math.max(minimumTop, Math.min(candidate.top, maximumTop)),
  };
}
