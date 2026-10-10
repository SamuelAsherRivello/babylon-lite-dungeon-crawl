# Rogue's Dungeon Code Organization

- `src/game/` owns serializable simulation data and turn rules; it must not depend on React or rendering APIs.
- `src/content/` mounts the active game experience.
- `src/ui/` owns the PC-landscape/mobile-portrait browser surface, developer-only PC aspect preview, command desk, and styles. Keep primary game UI inside the fitted viewport; do not restore template corner units. Portrait uses a statusbar Control/Info toggle to switch the bottom content.
- Keep movement, enemy phases, persistence, and choices deterministic from explicit state where practical.
- Keep supplied Tiled tile sources and sample maps together under `public/assets/` so their relative references remain valid.
