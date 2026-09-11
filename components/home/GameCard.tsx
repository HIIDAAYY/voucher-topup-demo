import Link from 'next/link'
import { Gamepad2, Flame, Crosshair, Target, type LucideIcon } from 'lucide-react'
import type { Game } from '@/lib/types'

const ICONS: Record<string, LucideIcon> = {
  'gamepad-2': Gamepad2,
  flame: Flame,
  crosshair: Crosshair,
  target: Target,
}

export function GameCard({ game }: { game: Game }) {
  const Icon = ICONS[game.icon] ?? Gamepad2
  return (
    <Link
      href={`/produk/${game.slug}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 hover:border-accent-to"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent-from to-accent-to">
        <Icon size={24} className="text-white" />
      </div>
      <span className="font-medium">{game.name}</span>
      <span className="text-xs text-gray-400">
        {game.rating.toFixed(2)} dari {game.ratingCount.toLocaleString('id-ID')} rating
      </span>
    </Link>
  )
}
