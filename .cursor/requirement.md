# poke-counter — companion app for Pokémon TCG

Track remaining HP and abnormal statuses for both players on one shared device.

## Phase 1 (all manual)

### Layout
- Portrait-only, full-bleed (`100dvh`); prevent page scroll/zoom as much as the browser allows
- Screen split into two halves stacked vertically; top half rotated 180° so each player faces their UI
- Per half, left → right: status toggles | HP + bench | control stack
- **5 bench slots** under the HP box; each has its own HP + statuses
- Single tap a bench slot (or the HP box) to select it for editing; controls/statuses apply to the selection
- Double-tap a filled bench slot to swap it with the active Pokémon
- When active is unset (e.g. after faint reset): grey out the HP box; highlight filled bench slots with the half accent border; **single tap** promotes that bench Pokémon to active

### HP model
- Remaining HP (not damage counters)
- Floor at 0; no ceiling (heal can exceed starting HP)
- Unset state shows `—`; +/− disabled until set (except first `+` from unset)
- From unset, treat as 0: first `+` sets HP to the current step
- At 0 (active or bench): show fainted cue; auto-Reset that Pokémon after ~1s (heal before then cancels)
- Reset control clears the **currently selected** Pokémon (active or bench slot); step resets only when clearing active


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

## Phase 2 — coin flip
- Per half: **Flip** button beside **Reset** (same row: Flip | Reset)
- Tap Flip → short coin-flip animation as a centered overlay over the **whole app** (covers both halves)
- One coin only (single orientation; not duplicated/rotated for each player)
- After the animation, show heads or tails (fair 50/50); dismiss on tap (or auto-dismiss after a short beat)
- No persistence of flip result required

## Out of scope / later
- Number pad / free digit entry for HP
- Soft TCG status rules (A/P/C exclusive; poison & burn stack)
- PWA / add-to-home-screen
- Themed or dark “arcade” visuals
- Landscape dual layout
- Effect engine, deck/prize tracking, timers
- Backend / multi-device sync
