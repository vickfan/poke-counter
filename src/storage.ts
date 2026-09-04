import { defaultPlayerState, type PlayerState } from './player'

const KEY = 'poke-counter-v1'

export type AppState = {
  top: PlayerState
  bottom: PlayerState
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { top: defaultPlayerState(), bottom: defaultPlayerState() }
    const parsed = JSON.parse(raw) as AppState
    return {
      top: { ...defaultPlayerState(), ...parsed.top, statuses: { ...defaultPlayerState().statuses, ...parsed.top?.statuses } },
      bottom: { ...defaultPlayerState(), ...parsed.bottom, statuses: { ...defaultPlayerState().statuses, ...parsed.bottom?.statuses } },
    }
  } catch {
    return { top: defaultPlayerState(), bottom: defaultPlayerState() }
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
