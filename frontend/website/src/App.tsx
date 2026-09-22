import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/layout/Navbar";
import { Void, useStageTransition } from "@clocess/shared/void";
import { Hero } from "@/pages/Hero/Hero";

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

  // docs brings its own nav, so the landing chrome stays out
  const ownLayout = location.pathname.startsWith("/docs");
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
