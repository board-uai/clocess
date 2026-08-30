import { Container } from '@/ui/Container'

export function Dashboard() {
  return (
    <section className="grid gap-5 sm:grid-cols-[1fr_1.4fr]">
      <Container className="flex min-h-100 items-center justify-center">
        <p className="text-4xl"></p>
      </Container>

      <Container className="min-h-44">{}</Container>

      <Container className="min-h-100 sm:col-span-2">{}</Container>
    </section>
  )
}