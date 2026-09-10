import { AUTH_DUR, type StageName } from "@/scene";
import { useCallback, useEffect, useState } from "react";
import type { Location, NavigateFunction } from "react-router-dom";

export const stageFor = (pathName: string): StageName => {
  return pathName === "/" ? "hero" : "auth";
};

export const useStageTransition = (
  location: Location,
  navigate: NavigateFunction,
) => {
  const [docked, setDocked] = useState(false);
  const [returningFrom, setReturningFrom] = useState<string | null>(null);

  const leaving = returningFrom === location.key;
  const stage = leaving ? "hero" : stageFor(location.pathname);

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

  return { stage, leaving, docked, setDocked, leave };
};
