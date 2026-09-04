import poisonedImg from '../assets/poisoned.png'
import burnedImg from '../assets/burned.png'
import asleepImg from '../assets/asleep.png'
import paralyzedImg from '../assets/paralyzed.png'
import confusedImg from '../assets/confused.png'

export const STEPS = [10, 50, 100] as const

export const STATUSES = [
  { id: 'poisoned', label: 'PSN', icon: poisonedImg, color: '#16a34a' },
  { id: 'burned', label: 'BRN', icon: burnedImg, color: '#dc2626' },
  { id: 'asleep', label: 'SLP', icon: asleepImg, color: '#2563eb' },
  { id: 'paralyzed', label: 'PAR', icon: paralyzedImg, color: '#ca8a04' },
  { id: 'confused', label: 'CNF', icon: confusedImg, color: '#7c3aed' },
] as const

export type StatusId = (typeof STATUSES)[number]['id']

export type PlayerState = {
  hp: number | null
  stepIndex: number
  statuses: Record<StatusId, boolean>
}

export function defaultPlayerState(): PlayerState {
  return {
    hp: null,
    stepIndex: 0,
    statuses: {
      poisoned: false,
      burned: false,
      asleep: false,
      paralyzed: false,
      confused: false,
    },
  }
}

export function cycleStep(state: PlayerState): PlayerState {
  return { ...state, stepIndex: (state.stepIndex + 1) % STEPS.length }
}

export function addHp(state: PlayerState): PlayerState {
  const step = STEPS[state.stepIndex]
  const base = state.hp ?? 0
  return { ...state, hp: base + step }
}

export function subHp(state: PlayerState): PlayerState {
  if (state.hp == null || state.hp === 0) return state
  return { ...state, hp: Math.max(0, state.hp - STEPS[state.stepIndex]) }
}

export function resetPlayer(): PlayerState {
  return defaultPlayerState()
}

export function toggleStatus(state: PlayerState, id: StatusId): PlayerState {
  return {
    ...state,
    statuses: { ...state.statuses, [id]: !state.statuses[id] },
  }
}
