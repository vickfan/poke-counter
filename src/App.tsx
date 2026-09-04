import { useCallback, useEffect, useState } from 'react'
import PlayerHalf from './PlayerHalf'
import CoinFlip, { type CoinSide } from './CoinFlip'
import { loadState, saveState, type AppState } from './storage'
import type { PlayerState } from './player'
import pokeball from '../assets/pokeball.png'

type FlipState = {
  result: CoinSide
  spinning: boolean
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [flip, setFlip] = useState<FlipState | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const setTop = (top: PlayerState) => setState((s) => ({ ...s, top }))
  const setBottom = (bottom: PlayerState) => setState((s) => ({ ...s, bottom }))

  const startFlip = () => {
    if (flip) return
    const result: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails'
    setFlip({ result, spinning: true })
  }

  const onSpinEnd = useCallback(() => {
    setFlip((f) => (f ? { ...f, spinning: false } : f))
  }, [])

  const onDismiss = useCallback(() => {
    setFlip(null)
  }, [])

  return (
    <div className="app">
      <section className="half half--rotated half--red" aria-label="Player top">
        <PlayerHalf state={state.top} onChange={setTop} onFlip={startFlip} />
      </section>
      <div className="divider" aria-hidden>
        <span className="divider-line divider-line--red" />
        <img className="divider-ball" src={pokeball} alt="" draggable={false} />
        <span className="divider-line divider-line--blue" />
      </div>
      <section className="half half--blue" aria-label="Player bottom">
        <PlayerHalf state={state.bottom} onChange={setBottom} onFlip={startFlip} />
      </section>
      {flip ? (
        <CoinFlip
          result={flip.result}
          spinning={flip.spinning}
          onSpinEnd={onSpinEnd}
          onDismiss={onDismiss}
        />
      ) : null}
    </div>
  )
}
