import poisonedImg from '../assets/poisoned.png'
import burnedImg from '../assets/burned.png'
import asleepImg from '../assets/asleep.png'
import paralyzedImg from '../assets/paralyzed.png'
import confusedImg from '../assets/confused.png'

export const STEPS = [10, 50, 100] as const
export const BENCH_SIZE = 5

export const STATUSES = [
  { id: 'poisoned', label: 'PSN', icon: poisonedImg, color: '#16a34a' },
  { id: 'burned', label: 'BRN', icon: burnedImg, color: '#dc2626' },
  { id: 'asleep', label: 'SLP', icon: asleepImg, color: '#2563eb' },
  { id: 'paralyzed', label: 'PAR', icon: paralyzedImg, color: '#ca8a04' },
  { id: 'confused', label: 'CNF', icon: confusedImg, color: '#7c3aed' },
] as const

export type StatusId = (typeof STATUSES)[number]['id']

export type PokemonState = {
  hp: number | null
  statuses: Record<StatusId, boolean>
}

export type PlayerState = {
  active: PokemonState
  bench: PokemonState[]
  stepIndex: number
}

export type FocusTarget = 'active' | number

export function emptyStatuses(): Record<StatusId, boolean> {
  return {
    poisoned: false,
    burned: false,
    asleep: false,
    paralyzed: false,
    confused: false,
  }
}

export function defaultPokemon(): PokemonState {
  return { hp: null, statuses: emptyStatuses() }
}

export function defaultPlayerState(): PlayerState {
  return {
    active: defaultPokemon(),
    bench: Array.from({ length: BENCH_SIZE }, () => defaultPokemon()),
    stepIndex: 0,
  }
}

export function getFocused(state: PlayerState, focus: FocusTarget): PokemonState {
  if (focus === 'active') return state.active
  return state.bench[focus] ?? state.active
}

export function setFocused(
  state: PlayerState,
  focus: FocusTarget,
  pokemon: PokemonState,
): PlayerState {
  if (focus === 'active') return { ...state, active: pokemon }
  const bench = state.bench.map((p, i) => (i === focus ? pokemon : p))
  return { ...state, bench }
}

export function cycleStep(state: PlayerState): PlayerState {
  return { ...state, stepIndex: (state.stepIndex + 1) % STEPS.length }
}

export function addHp(pokemon: PokemonState, stepIndex: number): PokemonState {
  const step = STEPS[stepIndex]
  const base = pokemon.hp ?? 0
  return { ...pokemon, hp: base + step }
}

export function subHp(pokemon: PokemonState, stepIndex: number): PokemonState {
  if (pokemon.hp == null || pokemon.hp === 0) return pokemon
  return { ...pokemon, hp: Math.max(0, pokemon.hp - STEPS[stepIndex]) }
}

export function damageActive(state: PlayerState, amount: number): PlayerState {
  if (state.active.hp == null) return state
  return {
    ...state,
    active: {
      ...state.active,
      hp: Math.max(0, state.active.hp - amount),
    },
  }
}

export function resetActive(state: PlayerState): PlayerState {
  return { ...state, active: defaultPokemon(), stepIndex: 0 }
}

export function resetPlayer(): PlayerState {
  return defaultPlayerState()
}

export function toggleStatus(pokemon: PokemonState, id: StatusId): PokemonState {
  return {
    ...pokemon,
    statuses: { ...pokemon.statuses, [id]: !pokemon.statuses[id] },
  }
}

export function swapWithBench(state: PlayerState, index: number): PlayerState {
  if (index < 0 || index >= state.bench.length) return state
  const fromBench = state.bench[index]
  if (fromBench?.hp == null || fromBench.hp <= 0) return state
  const bench = state.bench.slice()
  bench[index] = state.active
  return { ...state, active: fromBench, bench }
}
