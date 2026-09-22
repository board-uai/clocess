import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { SignedOut } from "./pages/SignedOut";
import { Api, Docs, Documentation, Overview } from "./pages/Docs";
import { RedirectIfAuthed } from "@clocess/shared/auth";
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
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "signed-out", element: <SignedOut /> },
        ],
      },
    ],
  },
]);
