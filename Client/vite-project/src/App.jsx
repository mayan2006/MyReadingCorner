import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import { useSiteBackground } from "./context/SiteBackgroundContext.jsx";
import SingleBook from "./Components/SingleBook";
import BooksPage from "./Components/BooksPage";
import Navbar from "./Components/Navbar";
import BackToHomeBar from "./Components/BackToHomeBar";
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import ManagerSubjectApprovals from "./Components/ManagerSubjectApprovals";
import FreeWriting from "./Components/FreeWriting";
import Profile from "./Components/Profile";
import MyBooks from "./Components/MyBooks";
import LaterBooks from "./Components/LaterBooks";
import FavoriteBooks from "./Components/FavoriteBooks";
import AuthorProfile from "./Components/AuthorProfile";
import SiteFooter from "./Components/SiteFooter";



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

/** גלילה לראש העמוד בכל מעבר בין נתיבים */
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
      <Box component="main" sx={{ flex: "1 1 auto", width: "100%" }}>
        <Routes>
          <Route path="/" element={<BooksPage selectedCategory={selectedCategory} />} />
          <Route path="/books/:bookCode" element={<SingleBook />} />
          <Route path="/users/:userCode" element={<AuthorProfile />} />
          <Route path="/FreeWriting/edit/:writingCode" element={<FreeWriting />} />
          <Route path="/FreeWriting" element={<FreeWriting />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/later" element={<LaterBooks />} />
          <Route path="/favorites" element={<FavoriteBooks />} />
          <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/manager/subjects" element={<ManagerSubjectApprovals />} />
        </Routes>
      </Box>
      <SiteFooter />
    </Box>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const syncUserFromStorage = () => {
      const raw = localStorage.getItem("currentUser");
      if (!raw) {
        setCurrentUser(null);
        return;
      }
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener("library-current-user-updated", syncUserFromStorage);
    return () => window.removeEventListener("library-current-user-updated", syncUserFromStorage);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <BrowserRouter>
      <AppShell
        currentUser={currentUser}
        handleLogout={handleLogout}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        handleLogin={handleLogin}
      />
    </BrowserRouter>
  );
}

export default App;
