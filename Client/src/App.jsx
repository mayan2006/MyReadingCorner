import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import { useSiteBackground } from "./context/SiteBackgroundContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute, ManagerRoute } from "./Components/ProtectedRoute.jsx";
import Navbar from "./Components/Navbar";
import BackToHomeBar from "./Components/BackToHomeBar";
import SiteFooter from "./Components/SiteFooter";
import PageFallback from "./Components/PageFallback.jsx";

const BooksPage = lazy(() => import("./Components/BooksPage"));
const SingleBook = lazy(() => import("./Components/SingleBook"));
const AuthorProfile = lazy(() => import("./Components/AuthorProfile"));
const FreeWriting = lazy(() => import("./Components/FreeWriting"));
const Profile = lazy(() => import("./Components/Profile"));
const MyBooks = lazy(() => import("./Components/MyBooks"));
const LaterBooks = lazy(() => import("./Components/LaterBooks"));
const FavoriteBooks = lazy(() => import("./Components/FavoriteBooks"));
const SignUp = lazy(() => import("./Components/SignUp"));
const Login = lazy(() => import("./Components/Login"));
const ManagerSubjectApprovals = lazy(() => import("./Components/ManagerSubjectApprovals"));

const NAV_HIDDEN_PATH_TESTERS = [
  /^\/books\/.+/,
  /^\/users\/.+/,
  /^\/Profile$/,
  /^\/favorites$/,
  /^\/later$/,
  /^\/my-books$/,
  /^\/manager\/subjects$/,
  /^\/FreeWriting(\/.*)?$/
];

function shouldHideNavbar(pathname) {
  return NAV_HIDDEN_PATH_TESTERS.some((re) => re.test(pathname));
}

function ScrollToTopOnRoute() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function AppShell({
  currentUser,
  handleLogout,
  selectedCategory,
  setSelectedCategory,
  handleLogin
}) {
  const location = useLocation();
  const hideNavbar = shouldHideNavbar(location.pathname);
  const { darkBg } = useSiteBackground();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        ...(darkBg
          ? {
              background:
                "radial-gradient(ellipse 120% 70% at 50% -15%, rgba(55, 65, 90, 0.28), transparent 52%), linear-gradient(180deg, #1c1c22 0%, #15151a 48%, #0f0f12 100%)"
            }
          : {})
      }}
    >
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "absolute",
          right: -9999,
          "&:focus": {
            right: 16,
            top: 16,
            zIndex: 4000,
            px: 2,
            py: 1,
            bgcolor: "#fff",
            color: "#1a2d4a",
            fontWeight: 700,
            borderRadius: 1,
            boxShadow: 2
          }
        }}
      >
        דלג לתוכן הראשי
      </Box>
      {!hideNavbar ? (
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      ) : (
        <BackToHomeBar />
      )}
      <ScrollToTopOnRoute />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flex: "1 1 auto", width: "100%", maxWidth: "100%", overflowX: "hidden", outline: "none" }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<BooksPage selectedCategory={selectedCategory} />} />
            <Route path="/books/:bookCode" element={<SingleBook />} />
            <Route path="/users/:userCode" element={<AuthorProfile />} />
            <Route
              path="/FreeWriting/edit/:writingCode"
              element={
                <ProtectedRoute>
                  <FreeWriting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/FreeWriting"
              element={
                <ProtectedRoute>
                  <FreeWriting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-books"
              element={
                <ProtectedRoute>
                  <MyBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/later"
              element={
                <ProtectedRoute>
                  <LaterBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoriteBooks />
                </ProtectedRoute>
              }
            />
            <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/manager/subjects"
              element={
                <ManagerRoute>
                  <ManagerSubjectApprovals />
                </ManagerRoute>
              }
            />
          </Routes>
        </Suspense>
      </Box>
      <SiteFooter />
    </Box>
  );
}

function App() {
  const { currentUser, login, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <BrowserRouter>
      <AppShell
        currentUser={currentUser}
        handleLogout={logout}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        handleLogin={login}
      />
    </BrowserRouter>
  );
}

export default App;
