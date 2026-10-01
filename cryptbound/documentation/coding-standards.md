# Cryptbound Code Organization

- `src/game/` owns serializable simulation data and turn rules; it must not depend on React or rendering APIs.
- `src/content/` mounts the active game experience.
- `src/ui/` owns the fixed landscape browser surface, corners, and styles.
- Keep movement, enemy phases, persistence, and choices deterministic from explicit state where practical.
- Keep supplied Tiled tile sources and sample maps together under `public/assets/` so their relative references remain valid.
