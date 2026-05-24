import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SiteBackgroundProvider } from "./context/SiteBackgroundContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SiteBackgroundProvider>
      <App />
    </SiteBackgroundProvider>
  </StrictMode>
);
