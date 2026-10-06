import { AUTH_DUR, type StageName } from "../scene";
import { useCallback, useEffect, useState } from "react";
import type { Location, NavigateFunction } from "react-router-dom";

export const stageFor = (pathName: string): StageName => {
  return pathName === "/" ? "hero" : "auth";
};

/** the app can't keep our canvas alive across its own hard navigation, so it
   hands back a flag instead: arrive already docked, then fly home for real */
const LEAVING_PARAM = "leaving";

export const useStageTransition = (
  location: Location,
  navigate: NavigateFunction,
) => {
  const [docked, setDocked] = useState(false);
  const [returningFrom, setReturningFrom] = useState<string | null>(null);
  const [bootingFromApp, setBootingFromApp] = useState(
    () => new URLSearchParams(location.search).has(LEAVING_PARAM),
  );

  const leaving = returningFrom === location.key;
  const stage = leaving ? "hero" : bootingFromApp ? "auth" : stageFor(location.pathname);

  useEffect(() => {
    if (!leaving) {
      return;
    }

    const id = setTimeout(() => navigate("/"), AUTH_DUR);

    return () => clearTimeout(id);
  }, [leaving, navigate]);

  const leave = useCallback(
    () => setReturningFrom(location.key),
    [location.key],
  );

  // one-time: the first paint already rendered docked above, now play the flight
  useEffect(() => {
    if (!bootingFromApp) {
      return;
    }
    leave();
    setBootingFromApp(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stage, leaving, docked, setDocked, leave };
};
