import type { PriceVariant } from '@/lib/types'
import { formatRupiah } from '@/lib/format'

type PriceCardProps = {
  variant: PriceVariant
  selected: boolean
  onSelect: (variant: PriceVariant) => void
}

export function PriceCard({ variant, selected, onSelect }: PriceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(variant)}
      className={`rounded-lg border p-3 text-left text-sm transition ${
        selected
          ? 'border-accent-to ring-2 ring-accent-to/50 bg-surface2'
          : 'border-border bg-surface hover:border-accent-to/60'
      }`}
    >
      <div className="font-medium">{variant.name}</div>
      <div className="mt-1 text-accent-to">{formatRupiah(variant.price)}</div>
    </button>
  )
}
