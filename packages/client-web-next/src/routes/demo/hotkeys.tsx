import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  HotkeysProvider,
  useHotkeys,
  useHotkeyRegistrations,
} from '@tanstack/react-hotkeys'

export const Route = createFileRoute('/demo/hotkeys')({
  component: HotkeysDemo,
})

function HotkeysDemo() {
  return (
    <HotkeysProvider>
      <HotkeysDemoInner />
    </HotkeysProvider>
  )
}

function HotkeysDemoInner() {
  const [log, setLog] = useState<Array<string>>([])
  const [count, setCount] = useState(0)
  const [enabled, setEnabled] = useState(true)

  const push = (msg: string) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)])

  useHotkeys(
    [
      {
        hotkey: 'ArrowUp',
        callback: () => {
          setCount((c) => c + 1)
          push('↑ ArrowUp → incremented counter')
        },
      },
      {
        hotkey: 'ArrowDown',
        callback: () => {
          setCount((c) => c - 1)
          push('↓ ArrowDown → decremented counter')
        },
      },
      {
        hotkey: 'R',
        callback: () => {
          setCount(0)
          push('r → reset counter')
        },
        options: { enabled },
      },
      {
        hotkey: 'Mod+K',
        callback: () => push('⌘/Ctrl+K → command palette shortcut fired'),
        options: { preventDefault: true },
      },
    ],
    { preventDefault: false },
  )

  const { hotkeys: registrations } = useHotkeyRegistrations()

  return (
    <main className="demo-page">
      <div className="mb-8">
        <p className="island-kicker mb-2">TanStack Hotkeys</p>
        <h1 className="demo-title mb-2">Keyboard Shortcuts</h1>
        <p className="demo-muted">
          Press the keys below while this page is focused.{' '}
          <code>useHotkeys</code> registers multiple shortcuts in a single hook
          call, supports <code>Mod</code> (⌘/Ctrl), and integrates with{' '}
          <code>HotkeysProvider</code> for scope defaults.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Counter panel */}
        <div className="demo-panel">
          <p className="demo-section-title mb-4">Counter</p>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-5xl font-bold text-[var(--sea-ink)]">
              {count}
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setEnabled((e) => !e)}
                className={`demo-button ${enabled ? '' : 'demo-button-secondary'}`}
              >
                Reset key: {enabled ? 'enabled' : 'disabled'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {(
              [
                ['↑ ArrowUp', 'Increment'],
                ['↓ ArrowDown', 'Decrement'],
                ['R', `Reset (${enabled ? 'on' : 'off'})`],
                ['⌘/Ctrl+K', 'Command palette'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="demo-list-item flex items-center justify-between">
                <span className="text-sm text-[var(--sea-ink-soft)]">{label}</span>
                <kbd className="demo-pill font-mono">{key}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div className="demo-panel">
          <p className="demo-section-title mb-4">Event log</p>
          {log.length === 0 ? (
            <p className="demo-muted text-sm">No events yet — press a shortcut.</p>
          ) : (
            <ul className="space-y-1">
              {log.map((entry, i) => (
                <li key={i} className="demo-list-item text-sm font-mono">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Registration table */}
      <div className="mt-8">
        <p className="demo-section-title mb-3">
          Registered hotkeys ({registrations.length})
        </p>
        <div className="demo-table-shell">
          <table className="demo-table">
            <thead>
              <tr>
                <th>Hotkey</th>
                <th>Enabled</th>
                <th>preventDefault</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <kbd className="demo-pill font-mono">{r.hotkey}</kbd>
                  </td>
                  <td>{r.options.enabled !== false ? '✓' : '✗'}</td>
                  <td>{r.options.preventDefault ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
