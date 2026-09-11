'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getGameBySlug, getPriceVariantsForGame } from '@/data/seed'
import { isAccountValid } from '@/lib/orderLogic'
import { useToast } from '@/components/shared/Toast'
import { useTransactions } from '@/context/TransactionContext'
import { AccountForm } from '@/components/product/AccountForm'
import { PriceGroup } from '@/components/product/PriceGroup'
import { ProductSidebar } from '@/components/product/ProductSidebar'
import type { PriceVariant } from '@/lib/types'

export default function ProductPage() {
  const params = useParams<{ game: string }>()
  const router = useRouter()
  const game = getGameBySlug(params.game)
  const { showToast } = useToast()
  const { createOrder } = useTransactions()

  const [accountId, setAccountId] = useState('')
  const [server, setServer] = useState('')
  const [selected, setSelected] = useState<PriceVariant | null>(null)

  const variants = useMemo(() => (game ? getPriceVariantsForGame(game.slug) : []), [game])
  const groups = useMemo(() => {
    const map = new Map<string, PriceVariant[]>()
    for (const v of variants) {
      const list = map.get(v.group) ?? []
      list.push(v)
      map.set(v.group, list)
    }
    return Array.from(map.entries())
  }, [variants])

  if (!game) {
    return <main className="mx-auto max-w-4xl px-4 py-16 text-center">Game tidak ditemukan.</main>
  }

  if (!game.hasFullCatalog) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-400">
        Produk {game.name} belum tersedia di demo ini.
      </main>
    )
  }

  const accountValid = isAccountValid(game, accountId, server)

  function handleSelect(variant: PriceVariant) {
    if (!accountValid) {
      showToast('Silahkan isi data akun terlebih dahulu.')
      return
    }
    setSelected(variant)
  }

  function handleOrder() {
    if (!accountValid || !selected) return
    const order = createOrder({
      gameSlug: game!.slug,
      gameName: game!.name,
      accountId,
      server: game!.requiresServer ? server : undefined,
      item: { name: selected.name, price: selected.price },
    })
    router.push(`/checkout/${order.code}`)
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{game.name}</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <AccountForm
            game={game}
            accountId={accountId}
            server={server}
            onAccountIdChange={setAccountId}
            onServerChange={setServer}
          />
          <div>
            <h2 className="mb-3 text-lg font-medium">Langkah 2: Pilih Nominal</h2>
            <div className="space-y-6">
              {groups.map(([title, items]) => (
                <PriceGroup
                  key={title}
                  title={title}
                  variants={items}
                  selectedId={selected?.id ?? null}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        </div>
        <ProductSidebar
          game={game}
          selected={selected}
          accountValid={accountValid}
          onOrder={handleOrder}
        />
      </div>
    </main>
  )
}
