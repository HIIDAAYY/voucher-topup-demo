# GacorStore Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js demo top-up voucher site ("GacorStore") that reproduces DrianStore's
2-step product flow (Data Akun → Pilih Nominal), a mock checkout with a dev-only payment
simulator, and a Cek Transaksi lookup — all backed by static seed data + localStorage, no real
payment/API integration.

**Architecture:** Next.js App Router + TypeScript + Tailwind. Static catalog data in
`data/seed.ts`. Order state lives in a React Context that mirrors itself to `localStorage`
(`gacorstore_orders` key), seeded once with 3 sample orders. No server, no database, no auth.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, lucide-react (icons), Vitest (unit tests
for pure logic), Vercel for deploy.

**Spec:** `docs/superpowers/specs/2026-09-11-gacorstore-demo-design.md`

## Global Constraints

- All UI copy in Bahasa Indonesia.
- Money formatted via `formatRupiah`: thousands separator is `.`, no decimals — `Rp 31.071`.
- No `alert()`, `confirm()`, or `prompt()` anywhere in `app/`, `components/`, `context/`, `lib/`.
- No licensed game logos — generic lucide-react icons only.
- "DEMO — simulasi, bukan transaksi sungguhan" badge rendered once in `app/layout.tsx` so it
  appears on every page.
- Mobile-first; must look correct at 390px viewport width.
- Brand name is **GacorStore** (not "DrianStore") everywhere in UI copy, metadata, and package name.
- Price cards must remain real `<button>` elements that are always clickable (never HTML
  `disabled`) so the invalid-click path can show the toast — validity is enforced in the
  `onClick` handler, not via `disabled`.
- "Pesan Sekarang!" button in the sidebar IS disabled (real `disabled` attribute) until both
  account data and a nominal are valid.

---

## File Structure

```
package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs
vitest.config.ts

app/
  layout.tsx
  globals.css
  page.tsx
  produk/[game]/page.tsx
  checkout/[orderId]/page.tsx
  cek-transaksi/page.tsx

components/
  layout/Header.tsx
  layout/Footer.tsx
  layout/DemoBadge.tsx
  home/HeroBanner.tsx
  home/SearchBar.tsx
  home/GameGrid.tsx
  home/GameCard.tsx
  home/CategoryTabs.tsx
  product/AccountForm.tsx
  product/PriceGroup.tsx
  product/PriceCard.tsx
  product/ProductSidebar.tsx
  checkout/PaymentMethodPicker.tsx
  checkout/PaymentInstructions.tsx
  shared/Toast.tsx
  shared/StatusBadge.tsx

context/
  TransactionContext.tsx

data/
  seed.ts

lib/
  types.ts
  format.ts
  format.test.ts
  orderLogic.ts
  orderLogic.test.ts
```

---

### Task 1: Project scaffold + Tailwind theme

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`,
  `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx` (shell only, no DemoBadge yet),
  `vitest.config.ts`
- Test: none (scaffold task; verified by build)

**Interfaces:**
- Produces: working `npm run dev` / `npm run build`, Tailwind class support, dark theme CSS
  variables (`--bg`, `--surface`, `--accent-from`, `--accent-to`) used by all later components.

- [ ] **Step 1: Scaffold Next.js app**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```
When prompted, accept defaults (no src dir, App Router yes).

- [ ] **Step 2: Install extra deps**

```bash
npm install lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Configure Tailwind dark theme tokens**

In `tailwind.config.ts`, extend `theme.extend.colors`:
```ts
colors: {
  bg: '#0b0b14',
  surface: '#14141f',
  surface2: '#1c1c2b',
  border: '#2a2a3d',
  accent: {
    from: '#7c3aed',
    to: '#3b82f6',
  },
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
},
```

In `app/globals.css`, set body background/text:
```css
body {
  background-color: #0b0b14;
  color: #e5e7eb;
}
```

- [ ] **Step 4: Create vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 5: Set app metadata to GacorStore**

In `app/layout.tsx`, set:
```ts
export const metadata = {
  title: 'GacorStore — Top Up Game Murah, Cepat, Terpercaya',
  description: 'Demo top up voucher game — simulasi, bukan transaksi sungguhan.',
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds with the default Next.js starter page still in place.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind dark theme"
```

---

### Task 2: Types, format utils, order logic (with unit tests)

**Files:**
- Create: `lib/types.ts`, `lib/format.ts`, `lib/format.test.ts`, `lib/orderLogic.ts`,
  `lib/orderLogic.test.ts`

**Interfaces:**
- Consumes: nothing (pure module)
- Produces:
  - `formatRupiah(n: number): string`
  - `generateOrderCode(): string` — format `GCR` + 8 uppercase alphanumeric chars, e.g. `GCR7XQ2K1B`
  - `isAccountValid(game: Game, accountId: string, server: string): boolean`
  - Types: `Game`, `PriceVariant`, `OrderStatus`, `Order` (used by every later task)

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export type Game = {
  slug: string
  name: string
  icon: string
  requiresServer: boolean
  rating: number
  ratingCount: number
  hasFullCatalog: boolean
}

export type PriceGroupName = 'Special Items' | 'Top Up Instan'

export type PriceVariant = {
  id: string
  gameSlug: string
  group: PriceGroupName
  name: string
  price: number
}

export type OrderStatus = 'Menunggu Pembayaran' | 'Diproses' | 'Berhasil'

export type PaymentMethod = 'QRIS' | 'Virtual Account'

export type Order = {
  code: string
  gameSlug: string
  gameName: string
  accountId: string
  server?: string
  item: { name: string; price: number }
  paymentMethod?: PaymentMethod
  status: OrderStatus
  createdAt: string
}
```

- [ ] **Step 2: Write failing tests for format.ts**

`lib/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatRupiah, generateOrderCode } from './format'

describe('formatRupiah', () => {
  it('formats with dot thousand separators and Rp prefix', () => {
    expect(formatRupiah(31071)).toBe('Rp 31.071')
  })
  it('formats small numbers without separators', () => {
    expect(formatRupiah(500)).toBe('Rp 500')
  })
  it('formats large numbers with multiple separators', () => {
    expect(formatRupiah(1250000)).toBe('Rp 1.250.000')
  })
})

describe('generateOrderCode', () => {
  it('starts with GCR and is 11 chars long', () => {
    const code = generateOrderCode()
    expect(code.startsWith('GCR')).toBe(true)
    expect(code.length).toBe(11)
  })
  it('generates unique codes across calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOrderCode()))
    expect(codes.size).toBe(50)
  })
})
```

- [ ] **Step 2b: Run tests to verify they fail**

Run: `npm run test -- lib/format.test.ts`
Expected: FAIL — `format.ts` does not exist yet.

- [ ] **Step 3: Implement `lib/format.ts`**

```ts
export function formatRupiah(amount: number): string {
  const withDots = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${withDots}`
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateOrderCode(): string {
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return `GCR${suffix}`
}
```

- [ ] **Step 4: Run format tests to verify they pass**

Run: `npm run test -- lib/format.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write failing tests for orderLogic.ts**

`lib/orderLogic.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { isAccountValid } from './orderLogic'
import type { Game } from './types'

const mlbb: Game = {
  slug: 'mobile-legends', name: 'Mobile Legends', icon: 'gamepad-2',
  requiresServer: true, rating: 5, ratingCount: 1200, hasFullCatalog: true,
}
const ff: Game = {
  slug: 'free-fire', name: 'Free Fire', icon: 'flame',
  requiresServer: false, rating: 5, ratingCount: 900, hasFullCatalog: true,
}

describe('isAccountValid', () => {
  it('requires both id and server for a requiresServer game', () => {
    expect(isAccountValid(mlbb, '', '')).toBe(false)
    expect(isAccountValid(mlbb, '123456', '')).toBe(false)
    expect(isAccountValid(mlbb, '123456', '2001')).toBe(true)
  })
  it('requires only id for a non-server game', () => {
    expect(isAccountValid(ff, '', '')).toBe(false)
    expect(isAccountValid(ff, '123456789', '')).toBe(true)
  })
  it('treats whitespace-only id as invalid', () => {
    expect(isAccountValid(ff, '   ', '')).toBe(false)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- lib/orderLogic.test.ts`
Expected: FAIL — `orderLogic.ts` does not exist yet.

- [ ] **Step 7: Implement `lib/orderLogic.ts`**

```ts
import type { Game } from './types'

export function isAccountValid(game: Game, accountId: string, server: string): boolean {
  if (accountId.trim().length === 0) return false
  if (game.requiresServer && server.trim().length === 0) return false
  return true
}
```

- [ ] **Step 8: Run orderLogic tests to verify they pass**

Run: `npm run test -- lib/orderLogic.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add lib/
git commit -m "feat: add types, formatRupiah, generateOrderCode, isAccountValid with tests"
```

---

### Task 3: Seed data

**Files:**
- Create: `data/seed.ts`

**Interfaces:**
- Consumes: `Game`, `PriceVariant`, `Order` from `lib/types.ts`
- Produces:
  - `games: Game[]` (4 entries: mobile-legends, free-fire, pubg-mobile, valorant)
  - `priceVariants: PriceVariant[]` (6–8 each for mobile-legends and free-fire only)
  - `seedOrders: Order[]` (3 entries, one per status)
  - `getGameBySlug(slug: string): Game | undefined`
  - `getPriceVariantsForGame(slug: string): PriceVariant[]`

- [ ] **Step 1: Write `data/seed.ts`**

```ts
import type { Game, PriceVariant, Order } from '@/lib/types'

export const games: Game[] = [
  {
    slug: 'mobile-legends', name: 'Mobile Legends', icon: 'gamepad-2',
    requiresServer: true, rating: 5.0, ratingCount: 18452, hasFullCatalog: true,
  },
  {
    slug: 'free-fire', name: 'Free Fire', icon: 'flame',
    requiresServer: false, rating: 5.0, ratingCount: 22110, hasFullCatalog: true,
  },
  {
    slug: 'pubg-mobile', name: 'PUBG Mobile', icon: 'crosshair',
    requiresServer: false, rating: 4.9, ratingCount: 9032, hasFullCatalog: false,
  },
  {
    slug: 'valorant', name: 'Valorant', icon: 'target',
    requiresServer: false, rating: 4.9, ratingCount: 5218, hasFullCatalog: false,
  },
]

export const priceVariants: PriceVariant[] = [
  // Mobile Legends — Special Items
  { id: 'ml-weekly', gameSlug: 'mobile-legends', group: 'Special Items', name: 'Weekly Diamond Pass', price: 31071 },
  { id: 'ml-twilight', gameSlug: 'mobile-legends', group: 'Special Items', name: 'Twilight Pass', price: 149000 },
  // Mobile Legends — Top Up Instan
  { id: 'ml-86', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '86 Diamonds', price: 22500 },
  { id: 'ml-172', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '172 Diamonds', price: 45000 },
  { id: 'ml-257', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '257 Diamonds', price: 67000 },
  { id: 'ml-344', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '344 Diamonds', price: 89000 },
  { id: 'ml-706', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '706 Diamonds', price: 179000 },
  { id: 'ml-2195', gameSlug: 'mobile-legends', group: 'Top Up Instan', name: '2195 Diamonds', price: 519000 },

  // Free Fire — Special Items
  { id: 'ff-membership', gameSlug: 'free-fire', group: 'Special Items', name: 'Member Mingguan', price: 29000 },
  { id: 'ff-levelup', gameSlug: 'free-fire', group: 'Special Items', name: 'Level Up Pass', price: 39000 },
  // Free Fire — Top Up Instan
  { id: 'ff-50', gameSlug: 'free-fire', group: 'Top Up Instan', name: '50 Diamonds', price: 8500 },
  { id: 'ff-100', gameSlug: 'free-fire', group: 'Top Up Instan', name: '100 Diamonds', price: 15500 },
  { id: 'ff-240', gameSlug: 'free-fire', group: 'Top Up Instan', name: '240 Diamonds', price: 35000 },
  { id: 'ff-355', gameSlug: 'free-fire', group: 'Top Up Instan', name: '355 Diamonds', price: 50000 },
  { id: 'ff-720', gameSlug: 'free-fire', group: 'Top Up Instan', name: '720 Diamonds', price: 99000 },
  { id: 'ff-1450', gameSlug: 'free-fire', group: 'Top Up Instan', name: '1450 Diamonds', price: 199000 },
]

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug)
}

export function getPriceVariantsForGame(slug: string): PriceVariant[] {
  return priceVariants.filter((p) => p.gameSlug === slug)
}

export const seedOrders: Order[] = [
  {
    code: 'GCRDEMO0001',
    gameSlug: 'mobile-legends', gameName: 'Mobile Legends',
    accountId: '123456789', server: '2001',
    item: { name: '172 Diamonds', price: 45000 },
    paymentMethod: 'QRIS', status: 'Menunggu Pembayaran',
    createdAt: '2026-09-10T09:15:00.000Z',
  },
  {
    code: 'GCRDEMO0002',
    gameSlug: 'free-fire', gameName: 'Free Fire',
    accountId: '987654321',
    item: { name: '240 Diamonds', price: 35000 },
    paymentMethod: 'Virtual Account', status: 'Diproses',
    createdAt: '2026-09-10T14:40:00.000Z',
  },
  {
    code: 'GCRDEMO0003',
    gameSlug: 'mobile-legends', gameName: 'Mobile Legends',
    accountId: '555222999', server: '3112',
    item: { name: 'Weekly Diamond Pass', price: 31071 },
    paymentMethod: 'QRIS', status: 'Berhasil',
    createdAt: '2026-09-09T18:05:00.000Z',
  },
]
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors related to `data/seed.ts`

- [ ] **Step 3: Commit**

```bash
git add data/
git commit -m "feat: add seed data for games, price variants, sample orders"
```

---

### Task 4: TransactionContext (localStorage-backed order store)

**Files:**
- Create: `context/TransactionContext.tsx`

**Interfaces:**
- Consumes: `Order`, `OrderStatus`, `PaymentMethod` from `lib/types.ts`; `seedOrders` from
  `data/seed.ts`; `generateOrderCode` from `lib/format.ts`
- Produces (hook `useTransactions()`):
  - `createOrder(input: { gameSlug: string; gameName: string; accountId: string; server?: string; item: { name: string; price: number } }): Order` — generates code, status `'Menunggu Pembayaran'`, persists, returns the new order
  - `getOrderByCode(code: string): Order | undefined`
  - `setPaymentMethod(code: string, method: PaymentMethod): void`
  - `simulatePaymentSuccess(code: string): void` — sets status to `'Diproses'` immediately, then
    after 1500ms sets it to `'Berhasil'`
  - Provider component `TransactionProvider`

- [ ] **Step 1: Implement `context/TransactionContext.tsx`**

```tsx
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Order, PaymentMethod } from '@/lib/types'
import { seedOrders } from '@/data/seed'
import { generateOrderCode } from '@/lib/format'

const STORAGE_KEY = 'gacorstore_orders'

type CreateOrderInput = {
  gameSlug: string
  gameName: string
  accountId: string
  server?: string
  item: { name: string; price: number }
}

type TransactionContextValue = {
  orders: Order[]
  createOrder: (input: CreateOrderInput) => Order
  getOrderByCode: (code: string) => Order | undefined
  setPaymentMethod: (code: string, method: PaymentMethod) => void
  simulatePaymentSuccess: (code: string) => void
}

const TransactionContext = createContext<TransactionContextValue | null>(null)

function loadOrders(): Order[] {
  if (typeof window === 'undefined') return seedOrders
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOrders))
    return seedOrders
  }
  try {
    return JSON.parse(raw) as Order[]
  } catch {
    return seedOrders
  }
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOrders(loadOrders())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    }
  }, [orders, hydrated])

  const createOrder = useCallback((input: CreateOrderInput): Order => {
    const order: Order = {
      code: generateOrderCode(),
      gameSlug: input.gameSlug,
      gameName: input.gameName,
      accountId: input.accountId,
      server: input.server,
      item: input.item,
      status: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
    }
    setOrders((prev) => [order, ...prev])
    return order
  }, [])

  const getOrderByCode = useCallback(
    (code: string) => orders.find((o) => o.code.toLowerCase() === code.trim().toLowerCase()),
    [orders],
  )

  const setPaymentMethod = useCallback((code: string, method: PaymentMethod) => {
    setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, paymentMethod: method } : o)))
  }, [])

  const simulatePaymentSuccess = useCallback((code: string) => {
    setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, status: 'Diproses' } : o)))
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => (o.code === code ? { ...o, status: 'Berhasil' } : o)))
    }, 1500)
  }, [])

  return (
    <TransactionContext.Provider
      value={{ orders, createOrder, getOrderByCode, setPaymentMethod, simulatePaymentSuccess }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions(): TransactionContextValue {
  const ctx = useContext(TransactionContext)
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider')
  return ctx
}
```

- [ ] **Step 2: Wrap the app in the provider**

In `app/layout.tsx`, import `TransactionProvider` and wrap `{children}` with it inside `<body>`.

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add context/ app/layout.tsx
git commit -m "feat: add TransactionContext with localStorage-backed order store"
```

---

### Task 5: Shared components — Toast, StatusBadge, DemoBadge, Header, Footer

**Files:**
- Create: `components/shared/Toast.tsx`, `components/shared/StatusBadge.tsx`,
  `components/layout/DemoBadge.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces:
  - `Toast` — a self-contained toast manager exposing `useToast()` hook with `showToast(message: string): void`, rendered via its own `ToastProvider` (mount once in `app/layout.tsx`, alongside `TransactionProvider`)
  - `StatusBadge({ status }: { status: OrderStatus })` — colored pill (warning/blue/success)
  - `DemoBadge()` — fixed small banner: "DEMO — simulasi, bukan transaksi sungguhan"
  - `Header()` — top nav with GacorStore logo/name
  - `Footer()` — simple footer

- [ ] **Step 1: Implement toast system in `components/shared/Toast.tsx`**

```tsx
'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type ToastItem = { id: number; message: string }

const ToastContext = createContext<{ showToast: (message: string) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-danger/40 bg-surface2 px-4 py-3 text-sm text-white shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
```

- [ ] **Step 2: Implement `components/shared/StatusBadge.tsx`**

```tsx
import type { OrderStatus } from '@/lib/types'

const STYLES: Record<OrderStatus, string> = {
  'Menunggu Pembayaran': 'bg-warning/20 text-warning border-warning/40',
  'Diproses': 'bg-accent-to/20 text-blue-300 border-blue-400/40',
  'Berhasil': 'bg-success/20 text-success border-success/40',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  )
}
```

- [ ] **Step 3: Implement `components/layout/DemoBadge.tsx`**

```tsx
export function DemoBadge() {
  return (
    <div className="w-full bg-accent-from/20 py-1.5 text-center text-xs text-purple-200">
      DEMO — simulasi, bukan transaksi sungguhan
    </div>
  )
}
```

- [ ] **Step 4: Implement `components/layout/Header.tsx` and `components/layout/Footer.tsx`**

Header: sticky top bar, `bg-surface`, border-bottom `border-border`, left side text logo
"Gacor<span class='text-accent-to'>Store</span>", right side link to `/cek-transaksi` labeled
"Cek Transaksi".

Footer: `bg-surface` full width, centered small text "© 2026 GacorStore — Demo, bukan layanan
resmi.".

- [ ] **Step 5: Wire into `app/layout.tsx`**

Order inside `<body>`: `<DemoBadge />`, `<ToastProvider><TransactionProvider><Header />{children}<Footer /></TransactionProvider></ToastProvider>`.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds

- [ ] **Step 7: Commit**

```bash
git add components/shared components/layout app/layout.tsx
git commit -m "feat: add Toast, StatusBadge, DemoBadge, Header, Footer"
```

---

### Task 6: Homepage

**Files:**
- Create: `components/home/HeroBanner.tsx`, `components/home/SearchBar.tsx`,
  `components/home/GameGrid.tsx`, `components/home/GameCard.tsx`, `components/home/CategoryTabs.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `games` from `data/seed.ts`
- Produces: fully rendered `/` route. `GameCard` links to `/produk/[slug]`.

- [ ] **Step 1: Implement `HeroBanner.tsx`**

Full-width gradient (`from-accent-from to-accent-to`) rounded-2xl section with heading "TOP UP
ALL GAME" and subheading "MURAH, CEPAT DAN TERPERCAYA".

- [ ] **Step 2: Implement `SearchBar.tsx`**

Client component, controlled `<input>` with placeholder "Cari Game atau Voucher", `value`/`onChange`
props passed down from `app/page.tsx` (lifted state there since page renders the grid too).

- [ ] **Step 3: Implement `GameCard.tsx`**

```tsx
import Link from 'next/link'
import { Gamepad2, Flame, Crosshair, Target, LucideIcon } from 'lucide-react'
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
```

This same `ICONS` map is reused as-is in `ProductSidebar.tsx` (Task 8) if a header icon is
wanted next to the game name — copy the map rather than importing across component files.

- [ ] **Step 4: Implement `GameGrid.tsx`**

Props: `{ games: Game[] }`. Responsive grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4`.
Renders `GameCard` per game; if `games.length === 0` show "Game tidak ditemukan.".

- [ ] **Step 5: Implement `CategoryTabs.tsx`**

Static tabs: "Top Up Game" (active, `bg-accent-to text-white`), "Live Streaming", "Voucher",
"Joki" — the last 3 rendered as non-interactive `<div>` (not `<button>`) with `opacity-50
cursor-not-allowed` and a small "Segera" badge, so they cannot be clicked at all.

- [ ] **Step 6: Wire `app/page.tsx`**

```tsx
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
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: hero renders, typing "mobile" in search filters grid to Mobile Legends only, all 4
game cards visible when search is empty, tabs show 3 disabled "Segera" entries.

- [ ] **Step 8: Commit**

```bash
git add components/home app/page.tsx
git commit -m "feat: build homepage with hero, search, game grid, category tabs"
```

---

### Task 7: Product page — Step 1 account form + Step 2 price selection with validation

**Files:**
- Create: `components/product/AccountForm.tsx`, `components/product/PriceCard.tsx`,
  `components/product/PriceGroup.tsx`
- Create: `app/produk/[game]/page.tsx` (without sidebar/checkout wiring yet — that's Task 8)

**Interfaces:**
- Consumes: `getGameBySlug`, `getPriceVariantsForGame` from `data/seed.ts`; `isAccountValid` from
  `lib/orderLogic.ts`; `useToast` from `components/shared/Toast.tsx`
- Produces: page-level state `{ accountId: string; server: string; selectedVariant: PriceVariant | null }`
  lifted in `app/produk/[game]/page.tsx`, passed to `AccountForm` and `PriceGroup`/`PriceCard`.
  `PriceCard` calls a passed-in `onSelect(variant)` prop that the page only honors if
  `isAccountValid(...)` is true — otherwise it calls `showToast('Silahkan isi data akun terlebih dahulu.')`.

- [ ] **Step 1: Implement `AccountForm.tsx`**

Props: `{ game: Game; accountId: string; server: string; onAccountIdChange: (v: string) => void; onServerChange: (v: string) => void }`.
Renders "Langkah 1: Masukkan Data Akun" heading, `<input>` for ID (placeholder "Masukkan User ID"),
and — only when `game.requiresServer` — a `<select>` with sample server options
(`['1001','2001','3112','4055','5210']`) placeholder "Pilih Server".

- [ ] **Step 2: Implement `PriceCard.tsx`**

Props: `{ variant: PriceVariant; selected: boolean; onSelect: (variant: PriceVariant) => void }`.
Renders a real `<button type="button">` (never `disabled`) showing `variant.name` and
`formatRupiah(variant.price)`; `selected` toggles a highlighted border
(`border-accent-to ring-2 ring-accent-to/50`). `onClick` always calls `onSelect(variant)` —
the parent decides whether to actually apply the selection or show the toast.

- [ ] **Step 3: Implement `PriceGroup.tsx`**

Props: `{ title: string; variants: PriceVariant[]; selectedId: string | null; onSelect: (variant: PriceVariant) => void }`.
Renders group title, then a responsive grid (`grid-cols-2 sm:grid-cols-3`) of `PriceCard`.

- [ ] **Step 4: Implement `app/produk/[game]/page.tsx` (Steps 1 & 2 only)**

```tsx
'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { getGameBySlug, getPriceVariantsForGame } from '@/data/seed'
import { isAccountValid } from '@/lib/orderLogic'
import { useToast } from '@/components/shared/Toast'
import { AccountForm } from '@/components/product/AccountForm'
import { PriceGroup } from '@/components/product/PriceGroup'
import type { PriceVariant } from '@/lib/types'

export default function ProductPage() {
  const params = useParams<{ game: string }>()
  const game = getGameBySlug(params.game)
  const { showToast } = useToast()

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
        {/* Sidebar added in Task 8 */}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, open `/produk/mobile-legends`.
Expected: clicking a price card before filling ID+Server shows the toast "Silahkan isi data akun
terlebih dahulu." and no card highlights; after filling ID and choosing a server, clicking a card
highlights it. Open `/produk/free-fire` and confirm no server dropdown appears and ID alone
unlocks selection. Open `/produk/pubg-mobile` and confirm the "belum tersedia" message renders
(200, not a crash).

- [ ] **Step 6: Commit**

```bash
git add components/product app/produk
git commit -m "feat: add product page Step 1/Step 2 with account validation gating"
```

---

### Task 8: Product page sidebar + order creation + redirect to checkout

**Files:**
- Create: `components/product/ProductSidebar.tsx`
- Modify: `app/produk/[game]/page.tsx`

**Interfaces:**
- Consumes: `useTransactions().createOrder` from `context/TransactionContext.tsx`; `useRouter`
  from `next/navigation`
- Produces: sidebar renders rating, "Butuh Bantuan?" box, selected-item summary, and "Pesan
  Sekarang!" button. Button `disabled={!accountValid || !selected}`. `onClick` calls
  `createOrder(...)` then `router.push('/checkout/' + order.code)`.

- [ ] **Step 1: Implement `ProductSidebar.tsx`**

Props: `{ game: Game; selected: PriceVariant | null; accountValid: boolean; onOrder: () => void }`.
Sections, top to bottom:
1. Rating: `"{game.rating.toFixed(2)} dari {game.ratingCount.toLocaleString('id-ID')} rating"`.
2. "Butuh Bantuan?" card with a short line of support copy (e.g. "Hubungi CS kami jika mengalami
   kendala saat top up.").
3. Selected item summary: if `selected` is set, show `selected.name` and `formatRupiah(selected.price)`;
   otherwise "Belum ada nominal dipilih.".
4. `<button disabled={!accountValid || !selected} onClick={onOrder}>Pesan Sekarang!</button>` —
   full width, gradient background, `disabled:opacity-40 disabled:cursor-not-allowed`.

- [ ] **Step 2: Wire into `app/produk/[game]/page.tsx`**

Add:
```tsx
import { useRouter } from 'next/navigation'
import { useTransactions } from '@/context/TransactionContext'
import { ProductSidebar } from '@/components/product/ProductSidebar'
```
Inside the component:
```tsx
const router = useRouter()
const { createOrder } = useTransactions()

function handleOrder() {
  if (!accountValid || !selected) return
  const order = createOrder({
    gameSlug: game.slug,
    gameName: game.name,
    accountId,
    server: game.requiresServer ? server : undefined,
    item: { name: selected.name, price: selected.price },
  })
  router.push(`/checkout/${order.code}`)
}
```
Replace the `{/* Sidebar added in Task 8 */}` comment with:
```tsx
<ProductSidebar game={game} selected={selected} accountValid={accountValid} onOrder={handleOrder} />
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`. On `/produk/mobile-legends`, confirm "Pesan Sekarang!" is disabled until both
ID+server and a nominal are set. Once enabled, clicking it navigates to `/checkout/GCRxxxxxxxx`
(a new code each time) — confirm the code appears in the URL.

- [ ] **Step 4: Commit**

```bash
git add components/product/ProductSidebar.tsx app/produk
git commit -m "feat: add product sidebar and wire order creation to checkout redirect"
```

---

### Task 9: Checkout page — payment method + instructions + payment simulator

**Files:**
- Create: `components/checkout/PaymentMethodPicker.tsx`, `components/checkout/PaymentInstructions.tsx`
- Create: `app/checkout/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `useTransactions()` (`getOrderByCode`, `setPaymentMethod`, `simulatePaymentSuccess`)
- Produces: fully working `/checkout/[orderId]` route with the two sub-states described in the spec.

- [ ] **Step 1: Implement `PaymentMethodPicker.tsx`**

Props: `{ onPick: (method: PaymentMethod) => void }`. Two selectable cards: "QRIS" and
"Virtual Account", each a `<button>` calling `onPick('QRIS')` / `onPick('Virtual Account')`.

- [ ] **Step 2: Implement `PaymentInstructions.tsx`**

Props: `{ order: Order; onSimulate: () => void }`. Shows:
- Kode order: `order.code` (monospace, copyable-looking box)
- If `order.paymentMethod === 'QRIS'`: a placeholder QR box (a bordered `<div>` with a QR-like
  SVG pattern or simple "QR CODE" placeholder text — no external image fetch) and "Scan QRIS
  untuk membayar {formatRupiah(order.item.price)}".
- If `'Virtual Account'`: fake VA line "Bank Mock VA: 8808{order.code slice}" and
  "Total: {formatRupiah(...)}".
- `<StatusBadge status={order.status} />`
- If `order.status !== 'Berhasil'`: dev-only button "Simulasikan Pembayaran Berhasil" calling
  `onSimulate`, styled distinctly (dashed border, "DEV" label) to signal it's a demo-only control.
- If `order.status === 'Berhasil'`: success message "Pembayaran berhasil! Item akan segera
  diproses." and no simulate button.

- [ ] **Step 3: Implement `app/checkout/[orderId]/page.tsx`**

```tsx
'use client'

import { useParams } from 'next/navigation'
import { useTransactions } from '@/context/TransactionContext'
import { PaymentMethodPicker } from '@/components/checkout/PaymentMethodPicker'
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions'
import type { PaymentMethod } from '@/lib/types'

export default function CheckoutPage() {
  const params = useParams<{ orderId: string }>()
  const { getOrderByCode, setPaymentMethod, simulatePaymentSuccess } = useTransactions()
  const order = getOrderByCode(params.orderId)

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-400">
        Pesanan tidak ditemukan.
      </main>
    )
  }

  function handlePick(method: PaymentMethod) {
    setPaymentMethod(order!.code, method)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-gray-400">
        {order.gameName} — {order.item.name}
      </p>
      <div className="mt-6">
        {!order.paymentMethod ? (
          <PaymentMethodPicker onPick={handlePick} />
        ) : (
          <PaymentInstructions order={order} onSimulate={() => simulatePaymentSuccess(order.code)} />
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`. Navigate through a full order from `/produk/free-fire`. On the checkout page,
pick "QRIS", confirm instructions + order code render. Click "Simulasikan Pembayaran Berhasil":
status badge should change to "Diproses" immediately, then to "Berhasil" about 1.5s later without
a page reload. Reload the page after that — status must still read "Berhasil" (localStorage
persisted).

- [ ] **Step 5: Commit**

```bash
git add components/checkout app/checkout
git commit -m "feat: add checkout flow with payment method picker and payment simulator"
```

---

### Task 10: Cek Transaksi page

**Files:**
- Create: `app/cek-transaksi/page.tsx`

**Interfaces:**
- Consumes: `useTransactions().getOrderByCode`; `StatusBadge`; `formatRupiah`

- [ ] **Step 1: Implement `app/cek-transaksi/page.tsx`**

```tsx
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
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-accent-to px-4 py-2 text-sm font-medium">
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
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`. Search `GCRDEMO0003` — expect full detail with status "Berhasil". Search
`ASALASALAN123` — expect "Transaksi tidak ditemukan." with no crash/error overlay. Search the
order code created in Task 9's manual test — expect it to appear with its current status.

- [ ] **Step 3: Commit**

```bash
git add app/cek-transaksi
git commit -m "feat: add Cek Transaksi lookup page"
```

---

### Task 11: Responsive polish, guardrail checks, README

**Files:**
- Modify: any component needing 390px-width fixes found during manual check
- Create: `README.md`

**Interfaces:** none new — verification + cleanup task.

- [ ] **Step 1: Check 390px layout**

Run: `npm run dev`. Using browser devtools device toolbar (or resizing the window), set viewport
width to 390px and click through `/`, `/produk/mobile-legends`, `/checkout/<code>`,
`/cek-transaksi`. Fix any horizontal overflow or unreadable text by adjusting Tailwind classes
(e.g. switching `grid-cols-3` to `grid-cols-2` at the `sm:` breakpoint, reducing padding).

- [ ] **Step 2: Run the alert/confirm/prompt guardrail check**

Run: `grep -rn "alert(\|confirm(\|prompt(" app/ components/ context/ lib/`
Expected: no output. If anything matches, remove/replace it before continuing.

- [ ] **Step 3: Run full unit test suite**

Run: `npm run test`
Expected: all tests from Task 2 pass.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Write `README.md`**

Short README: what this is (Tahap 1 demo, no real payment/API), how to run locally
(`npm install`, `npm run dev`), how to run tests (`npm run test`), and the 5-step manual flow to
try (from the spec's "Inti Demo" section).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: responsive polish, guardrail verification, README"
```

---

### Task 12: Deploy to Vercel

**Files:** none (deployment step)

**Interfaces:** none

- [ ] **Step 1: Install Vercel CLI if not present**

Run: `npx vercel --version`
If not installed, `npx vercel` will fetch it on demand — no global install needed.

- [ ] **Step 2: Deploy**

Run: `npx vercel --yes`
This may prompt for login (device/browser auth) and project linking on first run — follow the
CLI prompts. Note the preview URL it returns.

- [ ] **Step 3: Promote to production**

Run: `npx vercel --prod --yes`
Note the production URL it returns.

- [ ] **Step 4: Verify all routes return 200 on the production URL**

For each of `/`, `/produk/mobile-legends`, `/produk/free-fire`, `/produk/pubg-mobile`,
`/checkout/GCRDEMO0001`, `/cek-transaksi`, run:
```bash
curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://<production-url><path>
```
Expected: `200` for every path.

- [ ] **Step 5: Report checklist results**

Fill in the owner's verification checklist (from the brief) with LULUS/GAGAL per item, based on
what was actually run above — do not mark an item LULUS without having run its corresponding
step in this plan.
