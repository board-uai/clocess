import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Account, Dashboard, Profile } from "./pages/Account";
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
