import { Link, NavLink } from "react-router-dom";
import { Grid01, Server01, LogOut01 } from "@untitledui/icons";
import { useAuth } from "@/auth";

const SECTIONS = [
  { label: "Dashboard", to: "/account/dashboard", icon: Grid01 },
  { label: "Server", to: "/account/server", icon: Server01 },
];

// visible keyboard focus, shared by every interactive element in the rail
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// shared shape, no color/hover — those are mutually exclusive per state below
// Inter (font-nav) instead of the body face — thinner, built for compact UI chrome
const NAV_BASE = `font-nav flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-normal transition-colors ${FOCUS_RING}`;
// idle: quiet icon+label, hover wash, no border/box
const NAV_IDLE = "text-ink-3 hover:bg-hair hover:text-ink";
// active: a soft gray wash of the ink token — reads as gray in both light and dark, never a hard white/black block
const NAV_ACTIVE = "bg-ink/8 text-ink font-medium hover:bg-ink/12";

export function Sidebar() {
  const { user } = useAuth();
  const initial = user.email.charAt(0).toUpperCase();

  return (
    <nav
      aria-label="Account"
      className="fixed inset-x-0 top-0 z-20 flex h-16 items-center gap-2 border-b border-hair bg-ground px-pad sm:inset-y-0 sm:right-auto sm:h-auto sm:w-72 sm:flex-col sm:items-stretch sm:gap-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-8"
    >
      {/* wordmark — the only brand presence anywhere in /account, chrome is hidden here */}
      <Link
        to="/"
        className={`font-mark shrink-0 rounded-md text-[18px] text-ink transition-opacity hover:opacity-70 sm:mb-8 sm:text-[60px] ${FOCUS_RING}`}
      >
        clocess
      </Link>

      <div className="hidden border-t border-hair sm:mb-6 sm:block" />

      {/* primary nav */}
      <ul className="flex gap-1 sm:flex-col sm:gap-1">
        {SECTIONS.map(({ label, to, icon: Icon }) => (
          <li key={label}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_IDLE}`
              }
            >
              <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* bottom "session" cluster: identity + log out, pushed down by the spacer */}
      <div className="ml-auto flex items-center gap-2 sm:mt-auto sm:ml-0 sm:flex-col sm:items-stretch sm:gap-0">
        <div className="hidden border-t border-hair sm:mb-4 sm:block" />

        {/* identity — replaces the old standalone "profile" tile, bordered like an account card */}
        <Link
          to="/account"
          title={user.email}
          className={`flex shrink-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-hair sm:mb-2 sm:border sm:border-line sm:p-3 ${FOCUS_RING}`}
        >
          <span className="font-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-[16px] leading-none text-ink">
            <span className="translate-y-[2px]">{initial}</span>
          </span>
          {/* name/email hidden on mobile — no room, one tap to /account anyway */}
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-[15px] text-ink-2">
              {user.email.split("@")[0]}
            </span>
            <span className="truncate text-[13px] text-ink-3">
              {user.email}
            </span>
          </span>
        </Link>

        {/* the navbar is hidden on this page, this is the only way home */}
        <Link
          to="/"
          className={`font-nav flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-normal text-ink-3 transition-colors hover:bg-hair hover:text-ink ${FOCUS_RING}`}
        >
          <LogOut01 aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden sm:inline">log out</span>
        </Link>
      </div>
    </nav>
  );
}

export default Sidebar;
