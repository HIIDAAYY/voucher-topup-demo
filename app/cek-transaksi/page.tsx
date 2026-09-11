'use client'

import { useState } from 'react'
import { useTransactions } from '@/context/TransactionContext'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRupiah } from '@/lib/format'
import type { Order } from '@/lib/types'

export default function CekTransaksiPage() {
  const { getOrderByCode } = useTransactions()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Order | null | 'not-found'>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const found = getOrderByCode(code)
    setResult(found ?? 'not-found')
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-xl font-semibold">Cek Transaksi</h1>
      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Masukkan kode order, mis. GCRDEMO0001"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent-to"
        />
        <button type="submit" className="rounded-lg bg-accent-to px-4 py-2 text-sm font-medium text-white">
          Cari
        </button>
      </form>

      {result === 'not-found' && (
        <p className="mt-6 text-sm text-gray-400">Transaksi tidak ditemukan.</p>
      )}

      {result && result !== 'not-found' && (
        <div className="mt-6 space-y-2 rounded-xl border border-border bg-surface p-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Kode Order</span><span>{result.code}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Game</span><span>{result.gameName}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Item</span><span>{result.item.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Nominal</span><span>{formatRupiah(result.item.price)}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Tanggal</span><span>{new Date(result.createdAt).toLocaleString('id-ID')}</span></div>
          <div className="flex items-center justify-between"><span className="text-gray-400">Status</span><StatusBadge status={result.status} /></div>
        </div>
      )}
    </main>
  )
}
