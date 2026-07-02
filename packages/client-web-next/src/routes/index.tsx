import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Retrom Web — Next Generation</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Built on TanStack Start.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          A next-generation web client for Retrom, scaffolded with the TanStack
          CLI and powered by the full TanStack ecosystem: Start, Router, Query,
          Form, Hotkeys, and Virtual.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/about"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            About This App
          </Link>
          <a
            href="https://tanstack.com/start"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            TanStack Start Docs
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            [
              'TanStack Start',
              'SSR-first React meta-framework with server functions, streaming, and type-safe routing.',
              '/about',
            ],
            [
              'TanStack Query',
              'Async state management with caching, background refetching, and devtools.',
              '/demo/tanstack-query',
            ],
            [
              'TanStack Form',
              'Type-safe, schema-validated forms with nested fields and composable field components.',
              '/demo/form/simple',
            ],
            [
              'TanStack Virtual',
              'Virtualized lists and grids that render only what is visible, handling millions of rows.',
              '/demo/virtual',
            ],
            [
              'TanStack Hotkeys',
              'Declarative keyboard shortcuts with sequence support, scopes, and a devtools panel.',
              '/demo/hotkeys',
            ],
            [
              'TanStack Router',
              'Fully type-safe file-based routing with search params, loaders, and SSR hydration.',
              '/about',
            ],
          ] as const
        ).map(([title, desc, to], index) => (
          <Link
            key={title}
            to={to}
            className="island-shell feature-card rise-in rounded-2xl p-5 no-underline"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6">
        <p className="island-kicker mb-2">Stack</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
          <li>
            Scaffolded with{' '}
            <code>
              npx @tanstack/cli@latest create my-tanstack-app --agent
              --package-manager pnpm --tailwind --toolchain eslint --add-ons
              tanstack-query,form
            </code>
          </li>
          <li>
            TanStack Intent skills wired via{' '}
            <code>npx @tanstack/intent@latest install</code>
          </li>
          <li>
            React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 4 · ESLint 9
          </li>
        </ul>
      </section>
    </main>
  )
}
