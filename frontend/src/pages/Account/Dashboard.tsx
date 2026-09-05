import { Container } from '@/ui/Container'

export function Dashboard() {
  return (
    <section>
      <h1 className="mb-8 text-[22px]">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
        <Container className="min-h-40 sm:col-span-6" />

        <Container className="min-h-52 sm:col-span-2" />
        <Container className="min-h-52 sm:col-span-2" />
        <Container className="min-h-52 sm:col-span-2" />

        <Container className="min-h-60 sm:col-span-3" />
        <Container className="min-h-60 sm:col-span-3" />
      </div>
    </section>
  )
}
