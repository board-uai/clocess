import { Container } from '@/ui/Container'
import { useAuth } from '@/auth'

export function Profile() {
  const { user } = useAuth()

  return (
    <section>
      <h1 className="mb-8 text-[22px]">Settings</h1>

      <Container className="max-w-md">
        <p className="mb-2 text-[15px] text-ink-3">email</p>
        <p className="text-[17px]">{user.email}</p>
      </Container>
    </section>
  )
}
