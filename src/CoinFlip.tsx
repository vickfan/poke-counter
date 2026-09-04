import { useEffect } from 'react'
import pokeball from '../assets/pokeball.png'

export type CoinSide = 'heads' | 'tails'

type Props = {
  result: CoinSide
  spinning: boolean
  onSpinEnd: () => void
  onDismiss: () => void
}

export default function CoinFlip({ result, spinning, onSpinEnd, onDismiss }: Props) {
  useEffect(() => {
    if (spinning) return
    const id = window.setTimeout(onDismiss, 1400)
    return () => window.clearTimeout(id)
  }, [spinning, onDismiss])

  return (
    <button
      type="button"
      className="coin-overlay"
      onClick={() => {
        if (!spinning) onDismiss()
      }}
      aria-label={spinning ? 'Flipping coin' : `Result ${result}. Tap to dismiss`}
    >
      <div className="coin-scene">
        <div
          className={`coin coin--${result} ${spinning ? 'coin--spinning' : 'coin--landed'}`}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) onSpinEnd()
          }}
        >
          <div className="coin-face coin-face--heads">
            <img src={pokeball} alt="" draggable={false} />
          </div>
          <div className="coin-face coin-face--tails">
            <img src={pokeball} alt="" draggable={false} />
          </div>
        </div>
      </div>
    </button>
  )
}
