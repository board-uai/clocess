import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/auth'
import { deactivate } from '@/lib/api'
import { Button } from '@/ui/Button'
import { Container } from '@/ui/Container'
import { PANEL, PANEL_TITLE } from './Panel'

export function DeactivateAccount() {
  const navigate = useNavigate()
  const { refresh } = useSession()

  // the first press only asks, the second one does it
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onDeactivate() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    if (pending) return

    setError(null)
    setPending(true)
    try {
      await deactivate()
      navigate('/', { replace: true })
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
      setPending(false)
    }
  }

  return (
    <Container className={PANEL}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`mb-2 ${PANEL_TITLE}`}>deactivate account</h2>
          <p className="text-[16px] text-ink-2">
            {confirming ? 'sure? this signs you out right away.' : 'turns the account off and signs you out.'}
          </p>
          {error && (
            <p role="alert" className="mt-2 font-mono text-[13px] text-red-500">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-3">
          {confirming && (
            <Button
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="h-12 justify-center border border-line font-mono"
            >
              keep
            </Button>
          )}
          <button
            type="button"
            onClick={() => void onDeactivate()}
            disabled={pending}
            className="h-12 rounded-lg border border-red-500 px-7 font-mono text-[16px] text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-60"
          >
            {pending ? 'deactivating' : confirming ? 'yes, deactivate' : 'deactivate'}
          </button>
        </div>
      </div>
    </Container>
  )
}
