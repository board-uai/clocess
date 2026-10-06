import { FILE_GROUP, fileGroup } from './fileGroups'

const OUTLINE = '#F2F5F4'

interface FileIconProps {
  name: string
  className?: string
}

/** same tile proportions as the file cards in the hero, so one can stand in for the other */
export function FileIcon({ name, className }: FileIconProps) {
  const group = fileGroup(name)
  const kind = group === 'file' ? null : FILE_GROUP[group]
  const accent = kind?.color ?? OUTLINE

  return (
    <svg
      viewBox="0 0 70 45"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M54 .75H9A8.25 8.25 0 0 0 .75 9v27A8.25 8.25 0 0 0 9 44.25h52A8.25 8.25 0 0 0 69.25 36V16" stroke={OUTLINE} />
      <path d="M54 .75 69.25 16H57a3 3 0 0 1-3-3z" stroke={accent} />
      {kind && (
        <text x="35" y="27" fill={kind.color} fontFamily="bc-civitas, ui-sans-serif, system-ui, sans-serif" fontSize="11" textAnchor="middle" letterSpacing="0.6">
          {kind.label}
        </text>
      )}
    </svg>
  )
}
