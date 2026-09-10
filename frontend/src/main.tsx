import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/auth";
import "./index.css";
import { router } from "./Routes";
import { RouterProvider } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
