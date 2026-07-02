import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { useAppForm } from '#/hooks/demo.form'

export const Route = createFileRoute('/demo/form/simple')({
  component: SimpleForm,
})

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

function SimpleForm() {
  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: ({ value }) => {
      console.log(value)
      // Show success message
      alert('Form submitted successfully!')
    },
  })

  return (
    <main className="demo-page demo-center">
      <section className="demo-panel w-full max-w-2xl">
        <div className="mb-6">
          <p className="island-kicker mb-2">TanStack Form</p>
          <h1 className="demo-title">Simple Form</h1>
          <p className="demo-muted mt-2">
            A small validated form using the generated field helpers.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <form.AppField name="title">
            {(field) => <field.TextField label="Title" />}
          </form.AppField>

          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" />}
          </form.AppField>

          <div className="flex justify-end">
            <form.AppForm>
              <form.SubscribeButton label="Submit" />
            </form.AppForm>
          </div>
        </form>
      </section>
    </main>
  )
}
