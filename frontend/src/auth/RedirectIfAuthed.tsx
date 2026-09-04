import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "./session";

export function RedirectIfAuthed() {
  const { user, status } = useSession();

  if (status === "checking") return null;
  if (user) return <Navigate to="/account/" replace />;

  return <Outlet />;
}
