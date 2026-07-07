import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/emulators')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/emulators"!</div>
}
