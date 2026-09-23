import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Account, Dashboard, Profile } from "./pages/Account";
import { RequireAuth } from "@clocess/shared/auth";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <ErrorPage />,
      children: [
        {
          element: <RequireAuth />,
          children: [
            {
              path: "account",
              element: <Account />,
              children: [
                { index: true, element: <Dashboard /> },
                { path: "profile", element: <Profile /> },
              ],
            },
          ],
        },
      ],
    },
  ],
  { basename: "/app" },
);
