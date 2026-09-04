import { useEffect, useState } from 'react'
import PlayerHalf from './PlayerHalf'
import { loadState, saveState, type AppState } from './storage'
import type { PlayerState } from './player'
import pokeball from '../assets/pokeball.png'

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const setTop = (top: PlayerState) => setState((s) => ({ ...s, top }))
  const setBottom = (bottom: PlayerState) => setState((s) => ({ ...s, bottom }))

  return (
    <div className="app">
      <section className="half half--rotated half--red" aria-label="Player top">
        <PlayerHalf state={state.top} onChange={setTop} />
      </section>
      <div className="divider" aria-hidden>
        <span className="divider-line divider-line--red" />
        <img className="divider-ball" src={pokeball} alt="" draggable={false} />
        <span className="divider-line divider-line--blue" />
      </div>
      <section className="half half--blue" aria-label="Player bottom">
        <PlayerHalf state={state.bottom} onChange={setBottom} />
      </section>
    </div>
  )
}
