import type { DocGroup } from '../types'

export const API: DocGroup[] = [
  {
    title: 'Machines',
    pages: [
      { slug: 'machine-status', title: 'Get machine status' },
      { slug: 'register-machine', title: 'Register a machine' },
      { slug: 'remove-machine', title: 'Remove a machine' },
    ],
  },
]
