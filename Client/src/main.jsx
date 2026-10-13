import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";
import { SiteBackgroundProvider } from "./context/SiteBackgroundContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./Components/ErrorBoundary.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SiteBackgroundProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SiteBackgroundProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
