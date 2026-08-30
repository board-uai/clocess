import { get, json, send, url } from './client'

/** get_all selects id, filename and file_type only, the disk path never leaves the server */
export interface FileRecord {
  id: number
  filename: string
  file_type: string
}

export interface UploadResult {
  file_id: number
  file_path: string
}

/** the handler wraps the rows, and a user with no files gets null, not [] */
export async function listFiles() {
  const { files } = await get<{ files: FileRecord[] | null }>('/file/get_all')
  return files ?? []
}

export function uploadFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  // no content-type here, the browser has to set its own multipart boundary
  return send<UploadResult>('POST', '/file/upload', form)
}

export const deleteFile = (file_id: number) => json<null>('POST', '/file/delete', { file_id })

export const downloadUrl = (file_id: number) => url(`/file/download?file_id=${file_id}`)
