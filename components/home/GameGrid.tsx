import type { Game } from '@/lib/types'
import { GameCard } from './GameCard'

export function GameGrid({ games }: { games: Game[] }) {
  if (games.length === 0) {
    return <p className="text-center text-sm text-gray-400">Game tidak ditemukan.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.slug} game={game} />
      ))}
    </div>
  )
}
