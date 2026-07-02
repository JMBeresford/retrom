import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export const Route = createFileRoute('/demo/virtual')({
  component: VirtualDemo,
})

const ROW_COUNT = 10_000

type SortKey = 'id' | 'name' | 'status' | 'score'
type SortDir = 'asc' | 'desc'

const STATUSES = ['active', 'idle', 'offline'] as const
type Status = (typeof STATUSES)[number]

function makeRows() {
  return Array.from({ length: ROW_COUNT }, (_, i) => ({
    id: i + 1,
    name: `Item ${String(i + 1).padStart(5, '0')}`,
    status: STATUSES[i % STATUSES.length] as Status,
    score: Math.round(Math.sin(i) * 500 + 500),
  }))
}

const ALL_ROWS = makeRows()

function statusColor(s: Status) {
  if (s === 'active') return 'text-emerald-600'
  if (s === 'idle') return 'text-amber-500'
  return 'text-slate-400'
}

function VirtualDemo() {
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const rows = ALL_ROWS.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase()),
  ).sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul
    return String(av).localeCompare(String(bv)) * mul
  })

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <main className="demo-page demo-page-wide">
      <div className="mb-6">
        <p className="island-kicker mb-2">TanStack Virtual</p>
        <h1 className="demo-title mb-2">Virtual List</h1>
        <p className="demo-muted">
          Rendering{' '}
          <strong className="text-[var(--sea-ink)]">
            {ROW_COUNT.toLocaleString()} rows
          </strong>{' '}
          with <code>useVirtualizer</code> — only the visible rows are in the
          DOM. Filter and sort without layout thrash.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Filter by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="demo-input demo-input-fit w-64"
        />
        <span className="demo-pill">
          {rows.length.toLocaleString()} / {ROW_COUNT.toLocaleString()} rows
        </span>
        <span className="demo-pill">
          {virtualizer.getVirtualItems().length} rendered
        </span>
      </div>

      {/* Table header */}
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              {(
                [
                  ['id', '#'],
                  ['name', 'Name'],
                  ['status', 'Status'],
                  ['score', 'Score'],
                ] as Array<[SortKey, string]>
              ).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="cursor-pointer select-none"
                >
                  {label}
                  {sortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Virtualised body */}
        <div
          ref={parentRef}
          style={{ height: 480, overflowY: 'auto' }}
          className="relative"
        >
          <div
            style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
          >
            {virtualizer.getVirtualItems().map((vItem) => {
              const row = rows[vItem.index]!
              return (
                <div
                  key={vItem.key}
                  data-index={vItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${vItem.start}px)`,
                  }}
                  className="flex items-center border-b border-[var(--line)] px-4 py-3 text-sm hover:bg-[color-mix(in_oklab,var(--lagoon)_8%,transparent)]"
                >
                  <span className="w-16 text-[var(--sea-ink-soft)]">{row.id}</span>
                  <span className="flex-1 font-medium text-[var(--sea-ink)]">
                    {row.name}
                  </span>
                  <span className={`w-20 font-semibold ${statusColor(row.status)}`}>
                    {row.status}
                  </span>
                  <span className="w-16 text-right text-[var(--sea-ink-soft)]">
                    {row.score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="demo-muted mt-3 text-xs">
        Tip: click column headers to sort · only{' '}
        {virtualizer.getVirtualItems().length} DOM nodes are active at once
      </p>
    </main>
  )
}
