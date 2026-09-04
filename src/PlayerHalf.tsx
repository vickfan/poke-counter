import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  STEPS,
  STATUSES,
  BENCH_SIZE,
  addHp,
  subHp,
  cycleStep,
  resetActive,
  toggleStatus,
  swapWithBench,
  getFocused,
  setFocused,
  defaultPokemon,
  type PlayerState,
  type StatusId,
  type FocusTarget,
} from './player'

type Props = {
  state: PlayerState
  onChange: (next: PlayerState) => void
  onFlip: () => void
  onConfirmAttack: () => void
}

type Flash = 'heal' | 'damage'

const FAINT_RESET_MS = 1000
const DOUBLE_TAP_MS = 320

export default function PlayerHalf({ state, onChange, onFlip, onConfirmAttack }: Props) {
  const [focus, setFocus] = useState<FocusTarget>('active')
  const focused = getFocused(state, focus)
  const active = state.active
  const step = STEPS[state.stepIndex]
  const unset = focused.hp == null
  const atZero = focused.hp === 0
  const activeUnset = active.hp == null
  const activeAtZero = active.hp === 0
  const canSub = !unset && !atZero
  const [flash, setFlash] = useState<Flash | null>(null)
  const flashKey = useRef(0)
  const [flashTick, setFlashTick] = useState(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const stateRef = useRef(state)
  stateRef.current = state
  const lastTap = useRef({ t: 0, i: -1 })

  useEffect(() => {
    if (state.active.hp !== 0) return
    const id = window.setTimeout(() => {
      onChangeRef.current(resetActive(stateRef.current))
      setFocus('active')
    }, FAINT_RESET_MS)
    return () => window.clearTimeout(id)
  }, [state.active.hp])

  const faintStarted = useRef<(number | null)[]>(Array.from({ length: BENCH_SIZE }, () => null))
  const benchHpKey = state.bench.map((p) => p.hp).join(',')
  useEffect(() => {
    const now = Date.now()
    const timers: number[] = []
    for (let i = 0; i < BENCH_SIZE; i++) {
      const hp = stateRef.current.bench[i]?.hp
      if (hp !== 0) {
        faintStarted.current[i] = null
        continue
      }
      if (faintStarted.current[i] == null) faintStarted.current[i] = now
      const started = faintStarted.current[i] ?? now
      const remaining = Math.max(0, FAINT_RESET_MS - (now - started))
      const id = window.setTimeout(() => {
        const s = stateRef.current
        if (s.bench[i]?.hp !== 0) return
        faintStarted.current[i] = null
        onChangeRef.current(setFocused(s, i, defaultPokemon()))
        setFocus((f) => (f === i ? 'active' : f))
      }, remaining)
      timers.push(id)
    }
    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [benchHpKey])

  function blink(kind: Flash) {
    const id = ++flashKey.current
    setFlash(kind)
    setFlashTick(id)
    window.setTimeout(() => {
      if (flashKey.current === id) setFlash(null)
    }, 140)
  }

  const [attacking, setAttacking] = useState(false)
  const hpBoxRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!attacking) return
    const onPointerDown = (e: PointerEvent) => {
      const hpEl = hpBoxRef.current
      if (hpEl && e.target instanceof Node && hpEl.contains(e.target)) return
      setAttacking(false)
    }
    window.addEventListener('pointerdown', onPointerDown, true)
    return () => window.removeEventListener('pointerdown', onPointerDown, true)
  }, [attacking])

  useEffect(() => {
    if (activeAtZero || activeUnset) setAttacking(false)
  }, [activeAtZero, activeUnset])

  function onHpTap() {
    setFocus('active')
    if (activeAtZero) return
    if (attacking) {
      onConfirmAttack()
      setAttacking(false)
      return
    }
    setAttacking(true)
  }

  function updateFocused(pokemon: ReturnType<typeof getFocused>) {
    onChange(setFocused(state, focus, pokemon))
  }

  function onBenchTap(index: number) {
    const now = Date.now()
    const slot = state.bench[index]
    const canPromote = slot?.hp != null && slot.hp > 0

    if (state.active.hp == null && canPromote) {
      onChange(swapWithBench(state, index))
      setFocus('active')
      lastTap.current = { t: 0, i: -1 }
      return
    }

    if (lastTap.current.i === index && now - lastTap.current.t < DOUBLE_TAP_MS) {
      if (canPromote) {
        onChange(swapWithBench(state, index))
        setFocus('active')
      }
      lastTap.current = { t: 0, i: -1 }
      return
    }
    lastTap.current = { t: now, i: index }
    setFocus(index)
  }

  return (
    <div className="half-inner">
      <div className="statuses">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`status ${focused.statuses[s.id] ? 'on' : 'off'}`}
            style={{ '--status-color': s.color } as CSSProperties}
            onClick={() => updateFocused(toggleStatus(focused, s.id as StatusId))}
            aria-pressed={focused.statuses[s.id]}
            aria-label={s.id}
          >
            <img className="status-icon" src={s.icon} alt="" draggable={false} />
            <span className="status-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="center-col">
        <button
          ref={hpBoxRef}
          type="button"
          className={`hp-box ${activeAtZero ? 'ko' : ''} ${activeUnset ? 'empty' : ''} ${focus === 'active' ? 'selected' : ''} ${attacking ? 'attack' : ''}`}
          onClick={onHpTap}
        >
          <div className="hp-tag">HP</div>
          <div className={`hp-value ${activeAtZero ? 'fainted' : ''} ${attacking ? 'shrunk' : ''}`}>
            {activeAtZero ? 'POKEMON FAINTED' : activeUnset ? '—' : active.hp}
          </div>
          {attacking ? <div className="hp-attack">ATTACK</div> : null}
        </button>

        <div className="bench" role="group" aria-label="Bench">
          {Array.from({ length: BENCH_SIZE }, (_, i) => {
            const slot = state.bench[i] ?? defaultPokemon()
            const selected = focus === i
            const slotUnset = slot.hp == null
            const slotZero = slot.hp === 0
            const promotable = activeUnset && slot.hp != null && slot.hp > 0
            const activeStatuses = STATUSES.filter((s) => slot.statuses[s.id])
            return (
              <button
                key={i}
                type="button"
                className={`bench-slot ${selected ? 'selected' : ''} ${slotZero ? 'ko' : ''} ${slotUnset ? 'empty' : ''} ${promotable ? 'promotable' : ''}`}
                onClick={() => onBenchTap(i)}
                aria-label={`Bench ${i + 1}`}
              >
                <span className="bench-hp">
                  {slotZero ? 'FNT' : slot.hp == null ? '—' : slot.hp}
                </span>
                <span className="bench-statuses">
                  {activeStatuses.map((s, i) => (
                    <img
                      key={s.id}
                      className="bench-status-icon"
                      src={s.icon}
                      alt={s.label}
                      draggable={false}
                      style={{ zIndex: activeStatuses.length - i }}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="controls">
        <button type="button" className="ctrl" onClick={() => onChange(cycleStep(state))}>
          {step}
        </button>
        <button
          key={flash === 'heal' ? `heal-${flashTick}` : 'heal'}
          type="button"
          className={`ctrl ${flash === 'heal' ? 'flash-heal' : ''}`}
          onClick={() => {
            blink('heal')
            updateFocused(addHp(focused, state.stepIndex))
          }}
        >
          +
        </button>
        <button
          key={flash === 'damage' ? `damage-${flashTick}` : 'damage'}
          type="button"
          className={`ctrl ${flash === 'damage' ? 'flash-damage' : ''}`}
          disabled={!canSub}
          onClick={() => {
            blink('damage')
            updateFocused(subHp(focused, state.stepIndex))
          }}
        >
          −
        </button>
        <div className="ctrl-row">
          <button type="button" className="ctrl flip" onClick={onFlip} aria-label="Flip coin" />
          <button
            type="button"
            className="ctrl reset"
            onClick={() => {
              if (focus === 'active') onChange(resetActive(state))
              else updateFocused(defaultPokemon())
            }}
            aria-label="Reset"
          >
            <svg className="reset-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12a9 9 0 1 0 3-6.7"
              />
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4v5h5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
