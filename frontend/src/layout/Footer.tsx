import { Button } from "@/ui/Button";

const MADE_BY = [
  { name: "Danylo Patiuk", href: "https://github.com/Patiukdanylo" },
  { name: "Artem Kucheruk", href: "https://github.com/ArtemKucheruk" },
  { name: "Denys Herasymchuk", href: "https://github.com/DenysHerasymchuk" },
];

const LINK = "text-[15px] text-ink-3 transition-colors hover:text-ink";

export function Footer() {
  return (
    <footer className="relative z-10">
      <div className="flex min-h-76 flex-col justify-between gap-12 px-pad py-10">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-mark text-[clamp(44px,6vw,76px)] leading-none text-ink">
              clocess
            </p>
            <p className="mt-2 text-[13px] text-ink-3">
              All rights are reserved
            </p>
          </div>

          <p className="text-[15px] text-ink-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            &ldquo;cloud access from your phone or laptop&rdquo;
          </p>
        </div>

        <div className="flex items-end justify-between gap-8">
          <Button variant="ghost">contact</Button>

          <ul className="flex items-center gap-6">
            {MADE_BY.map(({ name, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={LINK}
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
