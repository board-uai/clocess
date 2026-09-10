import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "./session";

export function RequireAuth() {
  const location = useLocation();
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (user) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
