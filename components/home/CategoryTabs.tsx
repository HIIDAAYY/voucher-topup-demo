const DISABLED_TABS = ['Live Streaming', 'Voucher', 'Joki']

export function CategoryTabs() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="rounded-lg bg-accent-to px-4 py-2 text-sm font-medium text-white"
      >
        Top Up Game
      </button>
      {DISABLED_TABS.map((label) => (
        <div
          key={label}
          className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-gray-500 opacity-50"
        >
          {label}
          <span className="rounded-full bg-surface2 px-2 py-0.5 text-[10px]">Segera</span>
        </div>
      ))}
    </div>
  )
}
