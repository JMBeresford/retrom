import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/config/cloud-saves')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/config/cloud-saves"!</div>
}
