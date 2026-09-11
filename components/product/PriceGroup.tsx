import type { PriceVariant } from '@/lib/types'
import { PriceCard } from './PriceCard'

type PriceGroupProps = {
  title: string
  variants: PriceVariant[]
  selectedId: string | null
  onSelect: (variant: PriceVariant) => void
}

export function PriceGroup({ title, variants, selectedId, onSelect }: PriceGroupProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-400">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {variants.map((variant) => (
          <PriceCard
            key={variant.id}
            variant={variant}
            selected={selectedId === variant.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
