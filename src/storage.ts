import {
  BENCH_SIZE,
  defaultPlayerState,
  defaultPokemon,
  emptyStatuses,
  type PlayerState,
  type PokemonState,
} from './player'

const KEY = 'poke-counter-v2'

export type AppState = {
  top: PlayerState
  bottom: PlayerState
}

function normalizePokemon(raw: Partial<PokemonState> | undefined): PokemonState {
  return {
    hp: raw?.hp ?? null,
    statuses: { ...emptyStatuses(), ...raw?.statuses },
  }
}

function normalizePlayer(raw: unknown): PlayerState {
  const base = defaultPlayerState()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Record<string, unknown>

  // Legacy v1: { hp, statuses, stepIndex }
  if ('hp' in data || ('statuses' in data && !('active' in data))) {
    return {
      active: normalizePokemon({
        hp: data.hp as number | null | undefined,
        statuses: data.statuses as PokemonState['statuses'],
      }),
      bench: Array.from({ length: BENCH_SIZE }, () => defaultPokemon()),
      stepIndex: typeof data.stepIndex === 'number' ? data.stepIndex : 0,
    }
  }

  const active = normalizePokemon(data.active as Partial<PokemonState> | undefined)
  const rawBench = Array.isArray(data.bench) ? data.bench : []
  const bench = Array.from({ length: BENCH_SIZE }, (_, i) =>
    normalizePokemon(rawBench[i] as Partial<PokemonState> | undefined),
  )
  return {
    active,
    bench,
    stepIndex: typeof data.stepIndex === 'number' ? data.stepIndex : 0,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem('poke-counter-v1')
    if (!raw) return { top: defaultPlayerState(), bottom: defaultPlayerState() }
    const parsed = JSON.parse(raw) as { top?: unknown; bottom?: unknown }
    return {
      top: normalizePlayer(parsed.top),
      bottom: normalizePlayer(parsed.bottom),
    }
  } catch {
    return { top: defaultPlayerState(), bottom: defaultPlayerState() }
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}
