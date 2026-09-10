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

  const atAccount = location.pathname.startsWith("/account");
  const atAuth = stage === "auth" || leaving;
  const chrome = (docked || leaving || stage === "auth") && !atAccount;

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
