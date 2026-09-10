import { Button } from '@/ui/Button'

const DESTINATIONS = [
  { label: 'github', href: '#' },
  { label: 'docs', href: '#' },
]

export function Footer() {
  return (
    <footer className="relative z-10">
      <div className="flex min-h-76 flex-col justify-between gap-12 px-pad py-10">
        <div className="text-center">
          <p className="mb-10 text-[17px] text-ink-2">
            &ldquo;cloud access from your phone or laptop&rdquo;
          </p>

          <p className="font-mark text-[clamp(150px,6vw,106px)] leading-none text-ink">clocess</p>
          <p className="text-[15px]">MIT licensed</p>
        </div>

        <div className="flex items-center justify-between gap-6 mb-5">
          <ul className="flex items-center gap-5">
          {DESTINATIONS.map(({ label, href }) => (
            <li key={label}>
              <Button variant="quiet" href={href}>
                {label}
              </Button>
            </li>
          ))}
          </ul>

          <div className="flex items-center gap-6">
            <Button variant="quiet" to="/login">
              sign in
            </Button>
            <Button to="/register">register</Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
