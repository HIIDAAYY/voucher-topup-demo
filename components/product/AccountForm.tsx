import type { Game } from '@/lib/types'

const SERVER_OPTIONS = ['1001', '2001', '3112', '4055', '5210']

type AccountFormProps = {
  game: Game
  accountId: string
  server: string
  onAccountIdChange: (value: string) => void
  onServerChange: (value: string) => void
}

export function AccountForm({
  game,
  accountId,
  server,
  onAccountIdChange,
  onServerChange,
}: AccountFormProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-3 text-lg font-medium">Langkah 1: Masukkan Data Akun</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={accountId}
          onChange={(e) => onAccountIdChange(e.target.value)}
          placeholder="Masukkan User ID"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-to"
        />
        {game.requiresServer && (
          <select
            value={server}
            onChange={(e) => onServerChange(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent-to sm:w-40"
          >
            <option value="">Pilih Server</option>
            {SERVER_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
