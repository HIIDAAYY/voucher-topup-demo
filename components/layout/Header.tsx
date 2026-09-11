import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Gacor<span className="text-accent-to">Store</span>
        </Link>
        <Link
          href="/cek-transaksi"
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent-to hover:text-accent-to"
        >
          Cek Transaksi
        </Link>
      </div>
    </header>
  )
}
