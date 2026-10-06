import { useState } from 'react'
import { Panel } from './Panel'

interface Credential {
  id: string
  name: string
  ip: string
  online: boolean
  /** the browser you are reading this in, it is signed out rather than revoked */
  current?: boolean
  pingMs?: number
  diskUsedGb?: number
  diskTotalGb?: number
  lastSeen?: string
}

// mock until the backend has machines to list
const MOCK_CREDENTIALS: Credential[] = [
  { id: 'browser', name: 'this browser', ip: '192.168.1.14', online: true, current: true, pingMs: 4 },
  { id: 'server_1', name: 'server_1', ip: '192.168.1.14', online: true, diskUsedGb: 3.2, diskTotalGb: 10 },
  { id: 'nas-attic', name: 'nas-attic', ip: '10.0.0.7', online: true, diskUsedGb: 39.4, diskTotalGb: 50 },
  { id: 'old-tower', name: 'old-tower', ip: '10.0.0.12', online: false, lastSeen: '3 d' },
]

/** past this share of its disk a machine is marked as filling up */
const NEARLY_FULL = 0.75

// fixed side columns, so every row lines up without sharing one grid
const ROW =
  'grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4 font-mono text-[15px] sm:grid-cols-[10px_minmax(0,1fr)_13rem_10rem_4.5rem]'

function dotClass({ online, current, diskUsedGb, diskTotalGb }: Credential) {
  if (!online) return 'bg-ink-3/60'
  if (current) return 'bg-indigo-400 ring-4 ring-indigo-400/25'
  if (diskUsedGb !== undefined && diskTotalGb && diskUsedGb / diskTotalGb >= NEARLY_FULL) return 'bg-red-300'
  return 'bg-indigo-400'
}

function metric(c: Credential) {
  if (c.pingMs !== undefined) {
    return <span className="text-indigo-500 dark:text-indigo-400">{c.pingMs} ms</span>
  }
  if (c.online && c.diskUsedGb !== undefined) {
    return <span className="text-ink-2">{c.diskUsedGb} / {c.diskTotalGb} GB</span>
  }
  return <span className="text-ink-3">—</span>
}

export function MachineCredentials() {
  const [credentials, setCredentials] = useState(MOCK_CREDENTIALS)

  // mock: only drops the row here, nothing is revoked yet
  function revoke(id: string) {
    setCredentials((list) => list.filter((c) => c.id !== id))
  }

  return (
    <Panel title="machine credentials">
      <ul className="-mt-2 divide-y divide-line">
        {credentials.map((c) => (
          <li key={c.id} className={ROW}>
            <span className={`h-2 w-2 rounded-full ${dotClass(c)}`} />

            <span className={`truncate ${c.current ? 'font-medium text-ink' : c.online ? 'text-ink' : 'text-ink-3'}`}>
              {c.name}
            </span>

            {/* on a phone the address and the metric drop under the name */}
            <span className="col-start-2 flex gap-4 text-[14px] sm:contents sm:text-[15px]">
              <span className={`truncate ${c.online ? 'text-ink-2' : 'text-ink-3'}`}>
                {c.online ? c.ip : `last seen ${c.lastSeen} ago`}
              </span>
              {metric(c)}
            </span>

            <span className="col-start-3 row-start-1 text-right sm:col-start-auto sm:row-start-auto">
              {c.current ? (
                <span className="text-ink-3">current</span>
              ) : (
                <button
                  type="button"
                  onClick={() => revoke(c.id)}
                  className="text-ink transition-colors hover:text-red-500"
                >
                  revoke
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
