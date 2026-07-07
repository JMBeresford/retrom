import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/config')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/config"!</div>
}
