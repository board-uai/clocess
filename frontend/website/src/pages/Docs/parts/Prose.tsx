import type { ReactNode } from 'react'

/** the building blocks articles are written with, so every page reads the same */

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="rounded-2xl border border-line bg-raise p-8">
      <p className="text-[17px] text-ink">{title}</p>
      <p className="mt-3 text-[17px] leading-8 text-ink-2">{children}</p>
    </aside>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-line pt-8 pb-4 text-[30px] font-light text-ink">{children}</h2>
  )
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-line bg-raise px-6 py-5 font-mono text-[15px] leading-7 text-ink">
      {children}
    </pre>
  )
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[16px]">
        <thead>
          <tr className="border-b border-line text-ink">
            {head.map((cell) => (
              <th key={cell} className="py-3 pr-6 font-normal">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line">
              {row.map((cell, j) => (
                <td key={j} className="py-3 pr-6 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[0.9em] text-ink">{children}</code>
}
