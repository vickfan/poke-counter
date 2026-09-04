import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  STEPS,
  STATUSES,
  addHp,
  subHp,
  cycleStep,
  resetPlayer,
  toggleStatus,
  type PlayerState,
  type StatusId,
} from './player'

type Props = {
  state: PlayerState
  onChange: (next: PlayerState) => void
  onFlip: () => void
}

type Flash = 'heal' | 'damage'

const FAINT_RESET_MS = 1000

export default function PlayerHalf({ state, onChange, onFlip }: Props) {
  const step = STEPS[state.stepIndex]
  const unset = state.hp == null
  const atZero = state.hp === 0
  const canSub = !unset && !atZero
  const [flash, setFlash] = useState<Flash | null>(null)
  const flashKey = useRef(0)
  const [flashTick, setFlashTick] = useState(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (state.hp !== 0) return
    const id = window.setTimeout(() => {
      onChangeRef.current(resetPlayer())
    }, FAINT_RESET_MS)
    return () => window.clearTimeout(id)
  }, [state.hp])

  function blink(kind: Flash) {
    const id = ++flashKey.current
    setFlash(kind)
    setFlashTick(id)
    window.setTimeout(() => {
      if (flashKey.current === id) setFlash(null)
    }, 140)
  }

  return (
    <div className="half-inner">
      <div className="statuses">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`status ${state.statuses[s.id] ? 'on' : 'off'}`}
            style={{ '--status-color': s.color } as CSSProperties}
            onClick={() => onChange(toggleStatus(state, s.id as StatusId))}
            aria-pressed={state.statuses[s.id]}
            aria-label={s.id}
          >
            <img className="status-icon" src={s.icon} alt="" draggable={false} />
            <span className="status-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className={`hp-box ${atZero ? 'ko' : ''}`}>
        <div className="hp-tag">HP</div>
        <div className={`hp-value ${atZero ? 'fainted' : ''}`}>
          {atZero ? 'POKEMON FAINTED' : unset ? '—' : state.hp}
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
            onChange(addHp(state))
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
            onChange(subHp(state))
          }}
        >
          −
        </button>
        <div className="ctrl-row">
          <button type="button" className="ctrl flip" onClick={onFlip} aria-label="Flip coin" />
          <button type="button" className="ctrl reset" onClick={() => onChange(resetPlayer())}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
