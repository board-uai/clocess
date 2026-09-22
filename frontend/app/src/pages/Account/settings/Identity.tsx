import { useAuth } from '@clocess/shared/auth'
import { Panel } from './Panel'

export function Identity() {
  const { user } = useAuth()

  return (
    <Panel title="identity">
      <dl>
        <div className="flex items-baseline justify-between gap-6">
          <dt className="shrink-0 text-[16px] text-ink-2">email</dt>
          <dd className="min-w-0 truncate font-mono text-[15px] font-medium text-ink">{user.email}</dd>
        </div>
      </dl>
    </Panel>
  )
}
