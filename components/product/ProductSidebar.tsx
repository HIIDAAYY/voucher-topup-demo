import type { Game, PriceVariant } from '@/lib/types'
import { formatRupiah } from '@/lib/format'

type ProductSidebarProps = {
  game: Game
  selected: PriceVariant | null
  accountValid: boolean
  onOrder: () => void
}

export function ProductSidebar({ game, selected, accountValid, onOrder }: ProductSidebarProps) {
  return (
    <aside className="h-fit space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <span className="font-medium text-white">{game.rating.toFixed(2)}</span>{' '}
        <span className="text-gray-400">
          dari {game.ratingCount.toLocaleString('id-ID')} rating
        </span>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <h3 className="font-medium">Butuh Bantuan?</h3>
        <p className="mt-1 text-gray-400">
          Hubungi CS kami jika mengalami kendala saat top up.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 text-sm">
        <h3 className="mb-2 font-medium">Ringkasan Pesanan</h3>
        {selected ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{selected.name}</span>
            <span className="font-medium text-accent-to">{formatRupiah(selected.price)}</span>
          </div>
        ) : (
          <p className="text-gray-500">Belum ada nominal dipilih.</p>
        )}
      </div>

      <button
        type="button"
        disabled={!accountValid || !selected}
        onClick={onOrder}
        className="w-full rounded-xl bg-gradient-to-r from-accent-from to-accent-to px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Pesan Sekarang!
      </button>
    </aside>
  )
}
