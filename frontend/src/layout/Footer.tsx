import { Button } from '@/ui/Button'

export function Footer() {
  return (
    <footer className="relative z-10">
      <div className="flex min-h-76 flex-col justify-between gap-12 px-pad py-10">
        <div className="flex items-center justify-between gap-6">
          <p className="text-[17px] text-ink-2">
            &ldquo;cloud access from your phone or laptop&rdquo;
          </p>
          <div className="flex items-center gap-6">
            <Button variant="quiet" to="/login">
              sign in
            </Button>
            <Button to="/register">register</Button>
          </div>
        </div>

          <div className="text-center">
            <p className="font-mark text-[clamp(100px,6vw,106px)] leading-none text-ink">clocess</p>
            <p className="mt-2 text-[13px] text-ink-3">All rights are reserved</p>
          </div>
      </div>
    </footer>
  )
}
