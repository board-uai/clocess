import { Navigate, Outlet, useLocation } from "react-router-dom";
import { rememberedEmail, useSession } from "./session";

export function RequireAuth() {
  const location = useLocation();
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (!user) {
    const to = rememberedEmail() ? "/signed-out" : "/login";
    const websiteUrl = import.meta.env.VITE_WEBSITE_URL as string | undefined;
    if (websiteUrl) {
      window.location.href = `${websiteUrl}${to}?from=${encodeURIComponent(location.pathname)}`;
      return null;
    }
    return <Navigate to={to} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user, status } = useSession();

  if (status === "checking") {
    return null;
  }

  if (user) {
    const appUrl = import.meta.env.VITE_APP_URL as string | undefined;
    if (appUrl) {
      window.location.href = `${appUrl}/account`;
      return null;
    }
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
