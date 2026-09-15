/**
 * One icon per kind of file, not per extension: a white outline with the group's
 * pale colour on the fold and the label. `FileIcon` draws it inline so the label
 * gets the page's Civitas; the copies in `public/svg/files` are for anywhere an
 * <img> is simpler, and fall back to a system face since an <img> cannot load a
 * web font — change a colour here and in the matching SVG together.
 */
export const FILE_GROUP = {
  doc: { label: 'DOC', color: '#E2F5B8', ext: ['md', 'txt', 'pdf', 'docx', 'rtf'] },
  data: { label: 'DATA', color: '#F5E2B3', ext: ['csv', 'json', 'yaml', 'yml', 'xml', 'xlsx'] },
  image: { label: 'IMG', color: '#C3D0FF', ext: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] },
  audio: { label: 'AUD', color: '#DCCFFF', ext: ['mp3', 'wav', 'flac', 'ogg', 'm4a'] },
  video: { label: 'VID', color: '#FAD0B5', ext: ['mp4', 'mov', 'webm', 'mkv', 'avi'] },
  code: {
    label: 'CODE',
    color: '#B8EAE6',
    ext: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cs', 'php', 'go', 'rs', 'c', 'cpp', 'rb', 'sh', 'sql', 'html', 'css'],
  },
  archive: { label: 'ZIP', color: '#F2F5F4', ext: ['zip', 'rar', '7z', 'tar', 'gz'] },
  key: { label: 'KEY', color: '#F0D0CC', ext: ['pem', 'key', 'crt'] },
} as const

export type FileGroup = keyof typeof FILE_GROUP | 'file'

const BY_EXT = new Map<string, FileGroup>(
  Object.entries(FILE_GROUP).flatMap(([group, { ext }]) =>
    ext.map((e) => [e, group as FileGroup] as const),
  ),
)

export function fileGroup(name: string): FileGroup {
  const dot = name.lastIndexOf('.')
  return dot < 0 ? 'file' : (BY_EXT.get(name.slice(dot + 1).toLowerCase()) ?? 'file')
}

export function fileIcon(name: string): string {
  return `/svg/files/${fileGroup(name)}.svg`
}
