import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "library-site-dark-bg";
const HTML_BODY_CLASS = "library-site-dark-bg";

function applyDarkBgClass(dark) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(HTML_BODY_CLASS, dark);
  document.body.classList.toggle(HTML_BODY_CLASS, dark);
}

const SiteBackgroundContext = createContext(null);

export function SiteBackgroundProvider({ children }) {
  const [darkBg, setDarkBg] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    applyDarkBgClass(darkBg);
    try {
      localStorage.setItem(STORAGE_KEY, darkBg ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [darkBg]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove(HTML_BODY_CLASS);
      document.body.classList.remove(HTML_BODY_CLASS);
    },
    []
  );

  const value = useMemo(
    () => ({
      darkBg,
      setDarkBg,
      toggleDarkBg: () => setDarkBg((v) => !v)
    }),
    [darkBg]
  );

  return <SiteBackgroundContext.Provider value={value}>{children}</SiteBackgroundContext.Provider>;
}

export function useSiteBackground() {
  const ctx = useContext(SiteBackgroundContext);
  if (!ctx) {
    throw new Error("useSiteBackground must be used within SiteBackgroundProvider");
  }
  return ctx;
}
