import type { ComponentProps } from 'react'

const BASE = 'rounded-3xl border border-line bg-raise p-10'

type ContainerProps = { className?: string } & Omit<ComponentProps<'div'>, 'className'>

export function Container({ className, ...rest }: ContainerProps) {
  return <div {...rest} className={className ? `${BASE} ${className}` : BASE} />
}
