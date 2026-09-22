import { ChangePassword, DeactivateAccount, Identity, MachineCredentials } from '@/pages/components/settings'

export function Profile() {
  return (
    // the layout drops pages 18svh down, settings climbs back to the sidebar's own py-10
    <section className="flex max-w-[1340px] flex-col gap-10 sm:-mt-[calc(18svh-2.5rem)]">
      <h1 className="text-[clamp(40px,5vw,64px)] leading-none font-light tracking-[-0.02em] text-ink">
        your account
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <Identity />
        <ChangePassword />
      </div>

      <MachineCredentials />
      <DeactivateAccount />
    </section>
  )
}
