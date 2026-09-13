import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Account, Dashboard, Profile } from "./pages/Account";
import { Api, Docs, Documentation, Overview } from "./pages/Docs";
import { RedirectIfAuthed, RequireAuth } from "./auth/CheckAuth";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: null },
      {
        path: "docs",
        element: <Docs />,
        children: [
          { index: true, element: <Overview /> },
          { path: "documentation/:slug?", element: <Documentation /> },
          { path: "api/:slug?", element: <Api /> },
        ],
      },
      {
        element: <RedirectIfAuthed />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "account",
            element: <Account />,
            children: [
              { index: true, element: <Dashboard /> },
              // Uncomment when servers page is done, don't forget about it dumbass
              // { path: "servers", element: <Servers /> },
              { path: "profile", element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
]);
