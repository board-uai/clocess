import { Outlet } from "react-router-dom";
import { useSession } from "./session";

export function RequireAuth({ loginUrl }: { loginUrl: string }) {
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (!user) {
    window.location.href = `${loginUrl}/login`;
    return null;
  }

  return <Outlet />;
}

export function RedirectIfAuthed({ appUrl }: { appUrl: string }) {
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (user) {
    window.location.href = `${appUrl}/account`;
    return null;
  }

  return <Outlet />;
}
