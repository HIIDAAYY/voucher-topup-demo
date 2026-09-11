'use client'

import { useMemo, useState } from 'react'
import { games } from '@/data/seed'
import { HeroBanner } from '@/components/home/HeroBanner'
import { SearchBar } from '@/components/home/SearchBar'
import { GameGrid } from '@/components/home/GameGrid'
import { CategoryTabs } from '@/components/home/CategoryTabs'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => games.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <HeroBanner />
      <div className="mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <div className="mt-8">
        <GameGrid games={filtered} />
      </div>
      <div className="mt-10">
        <CategoryTabs />
      </div>
    </main>
  )
}
