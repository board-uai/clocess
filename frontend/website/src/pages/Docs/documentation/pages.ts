import type { DocGroup } from '../types'
import { Introduction } from './articles/Introduction'

export const DOCUMENTATION: DocGroup[] = [
  {
    title: 'Get started',
    pages: [
      { slug: 'introduction', title: 'Introduction', Body: Introduction },
      { slug: 'install', title: 'Install the daemon' },
      { slug: 'pair', title: 'Pair a machine' },
      { slug: 'slice', title: 'A slice vs the whole machine' },
    ],
  },
  {
    title: 'Machines',
    pages: [
      { slug: 'status', title: 'Status and ping' },
      { slug: 'quota', title: 'Quotas' },
      { slug: 'remove', title: 'Remove a machine' },
    ],
  },
  {
    title: 'Files',
    pages: [
      { slug: 'upload', title: 'Upload and delete' },
      { slug: 'share', title: 'Share a file' },
    ],
  },
]
