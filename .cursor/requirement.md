# poke-counter — companion app for Pokémon TCG

Track remaining HP and abnormal statuses for both players on one shared device.

## Phase 1 (all manual)

### Layout
- Portrait-only, full-bleed (`100dvh`); prevent page scroll/zoom as much as the browser allows
- Screen split into two halves stacked vertically; top half rotated 180° so each player faces their UI
- Per half, left → right: status toggles | HP box (center) | control stack

### HP model
- Remaining HP (not damage counters)
- Floor at 0; no ceiling (heal can exceed starting HP)
- Unset state shows `—`; +/− disabled until set (except first `+` from unset)
- From unset, treat as 0: first `+` sets HP to the current step
- At 0: show `0` with a light KO visual cue (e.g. red HP box / “KO”); play continues; heal can raise HP again

### Controls (per half, right stack)
1. **Step** — cycles `10 → 50 → 100 → 10…`; default `10` on load and after Reset; independent per half; button label shows current step
2. **+** — add current step to HP
3. **−** — subtract current step from HP (clamped at 0); disabled when unset or at 0
4. **Reset** — HP → `—`, all statuses off, step back to `10`

### Statuses (per half, left stack)
- Independent manual toggles (any combo allowed; no TCG mutual-exclusion rules)
- poisoned, burned, asleep, paralyzed, confused
- Vertical stack: icon + abbreviated label (PSN / BRN / SLP / PAR / CNF)
- On = distinct color; off = grey overlay

### Persistence
- `localStorage` restores both halves (HP, statuses, step) after reload
- Reset updates stored state for that half

### Stack & look
- Vite + React + TypeScript
- Utilitarian high-contrast UI; readability over theme

## Out of scope / later
- Number pad / free digit entry for HP
- Soft TCG status rules (A/P/C exclusive; poison & burn stack)
- PWA / add-to-home-screen
- Themed or dark “arcade” visuals
- Landscape dual layout
- Auto-reset on KO
- Effect engine, deck/prize tracking, timers
- Backend / multi-device sync
