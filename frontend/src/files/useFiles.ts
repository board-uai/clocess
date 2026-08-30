import { useCallback, useEffect, useState } from 'react'
import { deleteFile, listFiles, uploadFile } from '@/lib/api'
import type { FileRecord } from '@/lib/api'

export type FilesStatus = 'loading' | 'ready' | 'failed'

/** the list is the server's, every write re-asks rather than patching it locally */
export function useFiles() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [status, setStatus] = useState<FilesStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    try {
      setFiles(await listFiles())
      setStatus('ready')
      setError(null)
    } catch (e) {
      setStatus('failed')
      setError(e instanceof Error ? e.message : 'could not reach the server')
    }
  }, [])

  /* the first ask lands in a callback, never straight into the effect body */
  useEffect(() => {
    let alive = true
    listFiles().then(
      (rows) => {
        if (!alive) return
        setFiles(rows)
        setStatus('ready')
      },
      (e: unknown) => {
        if (!alive) return
        setStatus('failed')
        setError(e instanceof Error ? e.message : 'could not reach the server')
      },
    )
    return () => {
      alive = false
    }
  }, [])

  /* one at a time, the id sequence is handed out per upload */
  const upload = useCallback(
    async (picked: FileList | null) => {
      if (!picked?.length) return
      setBusy(true)
      setError(null)
      try {
        for (const file of Array.from(picked)) await uploadFile(file)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'upload failed')
      }
      setBusy(false)
      await reload()
    },
    [reload],
  )

  const remove = useCallback(
    async (id: number) => {
      setBusy(true)
      setError(null)
      try {
        await deleteFile(id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'delete failed')
      }
      setBusy(false)
      await reload()
    },
    [reload],
  )

  return { files, status, error, busy, upload, remove, reload }
}
