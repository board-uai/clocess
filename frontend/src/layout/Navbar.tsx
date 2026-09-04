import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";
import { useSession } from "@/auth";

const DESTINATIONS = [
  { label: "docs", href: "#" },
  { label: "github", href: "https://github.com/board-uai/clocess" },
];

interface NavbarProps {
  /** which set of actions the corner holds, the fade itself rides the flight */
  atAuth: boolean;
  /** flies home first and routes after, so the form can fade out on the way */
  onLeave: () => void;
}

/** fixed, not sticky: in flow it would add its own height to every page */
export function Navbar({ atAuth, onLeave }: NavbarProps) {
  const { user } = useSession();

  return (
    <nav aria-label="Main" className="fixed inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-22 max-w-page items-center justify-between gap-8 px-pad">
        <ul className="flex items-center gap-8 sm:gap-12">
          {DESTINATIONS.map(({ label, href }) => (
            <li key={label}>
              <Button variant="quiet" href={href} target="_blank">
                {label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          {!user && (
            <div>
              <Button variant="quiet" to="/login">
                sign in
              </Button>

              <Button to="/register">
                register
                <span aria-hidden="true"></span>
              </Button>
            </div>
          )}
          {/* always in the flow so nothing shifts, it only fades with the flight */}
          <Button
            variant="quiet"
            onClick={onLeave}
            aria-hidden={!atAuth}
            // pointer-events alone still leaves it in the tab order while hidden
            tabIndex={atAuth ? undefined : -1}
            className={atAuth ? "exit-in" : "pointer-events-none opacity-0"}
          >
            return back
          </Button>

          {/* the cookie is still good, so the account is one click away, no form */}
          {user && (
            <Link
              to="/account"
              aria-label="your account"
              title={user.email}
              className="shrink-0 transition-opacity hover:opacity-70"
            >
              <img src="/svg/user.png" alt="" className="h-8 w-8" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
