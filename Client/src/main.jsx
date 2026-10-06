import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SiteBackgroundProvider } from "./context/SiteBackgroundContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SiteBackgroundProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SiteBackgroundProvider>
  </StrictMode>
);
