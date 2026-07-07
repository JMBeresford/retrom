import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/platforms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/platforms"!</div>
}
