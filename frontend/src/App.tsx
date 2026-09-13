import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/layout/Navbar";
import { Void } from "@/layout/Void";
import { Hero } from "@/pages/Hero/Hero";
import { useStageTransition } from "./hooks/useStageTransition";

/** the url is the source of truth for where the logo sits */

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const { stage, leaving, docked, setDocked, leave } = useStageTransition(
    location,
    navigate,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // these pages bring their own nav, so the landing chrome stays out
  const ownLayout = ["/account", "/docs"].some((p) =>
    location.pathname.startsWith(p),
  );
  const atAuth = stage === "auth" || leaving;
  const chrome = (docked || leaving || stage === "auth") && !ownLayout;

  return (
    <>
      <Void stage={stage} onDock={() => setDocked(true)} />
      {chrome && (
        <>
          <Navbar atAuth={atAuth} onLeave={leave} />
          <Hero />
        </>
      )}
      <Outlet />
    </>
  );
}

export default App;
