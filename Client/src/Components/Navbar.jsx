import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Autocomplete,
  TextField,
  InputAdornment,
  Avatar,
  Popover,
  Chip,
  CircularProgress,
  Divider,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Search as SearchIcon,
  AccountCircle,
  LoginRounded,
  PersonAddAltRounded,
  PersonRounded,
  LogoutRounded,
  AssignmentTurnedInRounded
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, resolveMediaUrl } from "../services/apiBase";
import { getAllFreeWriting } from "../services/freeWritingApi";
import { groupFreeWritingsBySeries, mapSeriesGroupToCatalogBook } from "../utils/freeWritingSeries";
import { getAllSubjects } from "../services/subjectApi";
import { NAV_CATEGORY_TABS, normalizeNavCategory } from "../constants/bookCategories";

const USER_BOOK_SEARCH_IMG = "https://placehold.co/600x800?text=User+Book";

const SearchWrap = styled("div")(({ theme }) => ({
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: 580,
  [theme.breakpoints.down("sm")]: { maxWidth: "100%" }
}));

export default function Navbar({ currentUser, onLogout, selectedCategory, onCategorySelect }) {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  // subjects mega-panel (hover)
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectPopoverAnchor, setSubjectPopoverAnchor] = useState(null);
  const [popoverCategory, setPopoverCategory] = useState(null);
  const openSubjectsTimerRef = useRef(null);
  const closeSubjectsTimerRef = useRef(null);

  const clearSubjectsOpenTimer = () => {
    if (openSubjectsTimerRef.current) {
      clearTimeout(openSubjectsTimerRef.current);
      openSubjectsTimerRef.current = null;
    }
  };
  const clearSubjectsCloseTimer = () => {
    if (closeSubjectsTimerRef.current) {
      clearTimeout(closeSubjectsTimerRef.current);
      closeSubjectsTimerRef.current = null;
    }
  };

  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const data = await getAllSubjects();
      setAllSubjects(Array.isArray(data) ? data : []);
    } catch {
      setAllSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  const categories = NAV_CATEGORY_TABS;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const scrollBooksHomeToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    // Load Google Fonts for the elegant Hebrew title once
    const id = "navbar-fonts-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Heebo:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    const onSubjectsUpdated = () => {
      fetchSubjects();
    };
    window.addEventListener("library:subjects-updated", onSubjectsUpdated);
    return () => {
      window.removeEventListener("library:subjects-updated", onSubjectsUpdated);
      clearSubjectsOpenTimer();
      clearSubjectsCloseTimer();
    };
  }, [fetchSubjects]);

  /** רק נושאים שאושרו במפורש על ידי מנהל ושויכו לקטגוריה הזו באישור */
  const subjectsForCategory = useMemo(() => {
    if (!popoverCategory) return [];
    const cat = normalizeNavCategory(popoverCategory);
    return allSubjects.filter((s) => {
      if (s.managerApproved !== true) return false;
      if (s.isApproved === false) return false;
      const cc = normalizeNavCategory(s.categoryCode ?? "");
      if (!cc) return false;
      return cc === cat;
    });
  }, [allSubjects, popoverCategory]);

  const scheduleCloseSubjectsPanel = () => {
    clearSubjectsCloseTimer();
    closeSubjectsTimerRef.current = setTimeout(() => {
      setSubjectPopoverAnchor(null);
      setPopoverCategory(null);
      closeSubjectsTimerRef.current = null;
    }, 720);
  };

  const openSubjectsPanelNow = (cat, anchorEl) => {
    if (cat === "all" || !anchorEl) return;
    clearSubjectsOpenTimer();
    clearSubjectsCloseTimer();
    setSubjectPopoverAnchor(anchorEl);
    setPopoverCategory(cat);
    fetchSubjects();
  };

  const handleCategoryTabEnter = (cat, event) => {
    if (cat === "all") return;
    clearSubjectsCloseTimer();
    clearSubjectsOpenTimer();
    openSubjectsTimerRef.current = setTimeout(() => {
      openSubjectsPanelNow(cat, event.currentTarget);
      openSubjectsTimerRef.current = null;
    }, 90);
  };

  const handleCategoryTabLeave = () => {
    clearSubjectsOpenTimer();
    scheduleCloseSubjectsPanel();
  };

  const handleSubjectsPanelEnter = () => {
    clearSubjectsCloseTimer();
    clearSubjectsOpenTimer();
  };

  const handleSubjectsPanelLeave = () => {
    clearSubjectsOpenTimer();
    scheduleCloseSubjectsPanel();
  };

  useEffect(() => {
    const fetchBooksForSearch = async () => {
      try {
        const [booksRes, freeWritingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/books`),
          getAllFreeWriting()
        ]);
        const catalog = Array.isArray(booksRes.data) ? booksRes.data : [];
        const freeList = Array.isArray(freeWritingRes) ? freeWritingRes : [];
        const fwGroups = groupFreeWritingsBySeries(freeList);
        const userBooks = fwGroups.map((g) => {
          const row = mapSeriesGroupToCatalogBook(g, USER_BOOK_SEARCH_IMG);
          return {
            bookCode: row.bookCode,
            title: row.title,
            author: row.author,
            userCode: row.authorUserCode,
            searchHaystack: row.searchHaystack
          };
        });
        setAllBooks([...catalog, ...userBooks]);
      } catch {
        setAllBooks([]);
      }
    };
    fetchBooksForSearch();
  }, []);

  const navAvatarSrc = useMemo(() => {
    const img = currentUser?.img;
    if (!img || typeof img !== "string") return "";
    return resolveMediaUrl(img);
  }, [currentUser?.img]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allBooks
      .filter((book) => {
        const title = (book.title || "").toLowerCase();
        const author = (book.author || "").toLowerCase();
        const userCode = (book.userCode || "").toLowerCase();
        const haystack = (book.searchHaystack || "").toLowerCase();
        return (
          title.includes(query) ||
          author.includes(query) ||
          userCode.includes(query) ||
          haystack.includes(query)
        );
      })
      .slice(0, 7);
  }, [allBooks, search]);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const goToSignUp = () => { handleMenuClose(); navigate("/signup"); };
  const goToLogin = () => { handleMenuClose(); navigate("/login"); };
  const goToManagerSubjects = () => { handleMenuClose(); navigate("/manager/subjects"); };
  const handleProfile = () => { handleMenuClose(); navigate("/Profile"); };
  const handleLogoutClick = () => { handleMenuClose(); onLogout(); navigate("/"); };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: "100%",
        background:
          "linear-gradient(180deg, rgba(253,252,249,0.96) 0%, rgba(247,241,231,0.94) 100%)",
        color: "#1e2f4a",
        boxShadow: "0 8px 28px rgba(62, 48, 28, 0.08)",
        borderBottom: "1px solid rgba(201,166,106,0.35)",
        backdropFilter: "saturate(140%) blur(12px)",
        WebkitBackdropFilter: "saturate(140%) blur(12px)"
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          minHeight: { xs: 72, sm: 84, md: 96 },
          px: { xs: 1.5, sm: 3 },
          flexWrap: { xs: "wrap", md: "nowrap" }
        }}
      >
        {/* Left: user + search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            flex: { xs: "1 1 100%", md: "1 1 auto" },
            minWidth: 0,
            order: { xs: 2, md: 1 }
          }}
        >
          <IconButton
            onClick={handleMenuOpen}
            aria-label="תפריט משתמש"
            sx={{
              flexShrink: 0,
              p: navAvatarSrc ? 0.35 : 1,
              border: "1px solid #d6b884",
              backgroundColor: "#fffdf8",
              color: "#2a4a6e",
              transition: "all .25s ease",
              "&:hover": {
                backgroundColor: "#faf3e3",
                borderColor: "#b89552",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(184,149,82,0.25)"
              }
            }}
          >
            {navAvatarSrc ? (
              <Avatar
                src={navAvatarSrc}
                alt=""
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid rgba(255,253,248,0.95)",
                  boxShadow: "0 2px 8px rgba(62,48,28,0.12)"
                }}
                imgProps={{ referrerPolicy: "no-referrer" }}
              >
                {(currentUser?.firstName?.[0] || "?").toUpperCase()}
              </Avatar>
            ) : (
              <AccountCircle sx={{ fontSize: 40 }} />
            )}
          </IconButton>

          <Menu
            dir="rtl"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  mt: 1.25,
                  minWidth: { xs: "min(100vw - 32px, 320px)", sm: 272 },
                  maxWidth: 320,
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid rgba(201,166,106,0.45)",
                  boxShadow:
                    "0 18px 44px rgba(30, 47, 74, 0.14), 0 0 0 1px rgba(255,253,248,0.85) inset",
                  background:
                    "linear-gradient(165deg, rgba(255,253,248,0.98) 0%, rgba(250,244,232,0.96) 45%, rgba(245,251,255,0.94) 100%)",
                  backdropFilter: "saturate(140%) blur(14px)"
                }
              },
              list: {
                sx: {
                  py: 1,
                  px: 0,
                  "& .MuiMenuItem-root": {
                    fontFamily: '"Heebo", sans-serif',
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.15,
                    px: 2,
                    mx: 1,
                    mb: 0.35,
                    borderRadius: 2,
                    color: "#1a2d4a",
                    transition: "background .18s ease, transform .15s ease",
                    "&:hover": {
                      bgcolor: "rgba(166,124,50,0.12)",
                      transform: "translateY(-1px)"
                    },
                    "& .MuiListItemIcon-root": {
                      minWidth: 38,
                      color: "#a67c32"
                    }
                  }
                }
              }
            }}
          >
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 1.5,
                background:
                  "linear-gradient(90deg, rgba(166,124,50,0.1) 0%, rgba(31,93,153,0.06) 55%, transparent 100%)",
                borderBottom: "1px solid rgba(201,166,106,0.28)",
                direction: "rtl",
                textAlign: "right"
              }}
            >
              {currentUser ? (
                <>
                  <Typography
                    sx={{
                      fontFamily: '"Frank Ruhl Libre", "David", serif',
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      lineHeight: 1.25,
                      letterSpacing: "0.02em",
                      background: "linear-gradient(135deg, #1a2d4a 0%, #1f5d99 55%, #a67c32 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    שלום, {currentUser.firstName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.65,
                      fontFamily: '"Heebo", sans-serif',
                      fontSize: "0.72rem",
                      letterSpacing: "0.14em",
                      color: "#8b6914",
                      fontWeight: 600
                    }}
                  >
                    ספרייה דיגיטלית · החשבון שלך
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: '"Frank Ruhl Libre", "David", serif',
                      fontWeight: 800,
                      fontSize: "1.12rem",
                      lineHeight: 1.25,
                      background: "linear-gradient(135deg, #1a2d4a 0%, #1f5d99 55%, #a67c32 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    ברוכים הבאים
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.6,
                      fontFamily: '"Heebo", sans-serif',
                      fontSize: "0.78rem",
                      color: "#5d7ea0",
                      fontWeight: 500
                    }}
                  >
                    התחברו או הירשמו כדי לשמור ספרים ולכתוב
                  </Typography>
                </>
              )}
            </Box>

            <Box sx={{ py: 0.75 }}>
              {!currentUser ? (
                <>
                  <MenuItem onClick={goToLogin} disableRipple={false}>
                    <ListItemIcon>
                      <LoginRounded sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="כניסה"
                      primaryTypographyProps={{
                        fontFamily: '"Heebo", sans-serif',
                        fontWeight: 700,
                        fontSize: "0.95rem"
                      }}
                    />
                  </MenuItem>
                  <MenuItem onClick={goToSignUp}>
                    <ListItemIcon>
                      <PersonAddAltRounded sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="הרשמה"
                      primaryTypographyProps={{
                        fontFamily: '"Heebo", sans-serif',
                        fontWeight: 700,
                        fontSize: "0.95rem"
                      }}
                    />
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                      <PersonRounded sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="פרופיל"
                      primaryTypographyProps={{
                        fontFamily: '"Heebo", sans-serif',
                        fontWeight: 700,
                        fontSize: "0.95rem"
                      }}
                    />
                  </MenuItem>
                  {currentUser?.role === "manager" && (
                    <MenuItem onClick={goToManagerSubjects}>
                      <ListItemIcon>
                        <AssignmentTurnedInRounded sx={{ fontSize: 22 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="אישור נושאים"
                        primaryTypographyProps={{
                          fontFamily: '"Heebo", sans-serif',
                          fontWeight: 700,
                          fontSize: "0.95rem"
                        }}
                      />
                    </MenuItem>
                  )}
                  <Divider
                    sx={{
                      my: 0.75,
                      mx: 2,
                      borderColor: "rgba(201,166,106,0.35)"
                    }}
                  />
                  <MenuItem
                    onClick={handleLogoutClick}
                    sx={{
                      color: "#8b4513",
                      "&:hover": { bgcolor: "rgba(166,124,50,0.14)" },
                      "& .MuiListItemIcon-root": { color: "#c45c26 !important" }
                    }}
                  >
                    <ListItemIcon>
                      <LogoutRounded sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="התנתקות"
                      primaryTypographyProps={{
                        fontFamily: '"Heebo", sans-serif',
                        fontWeight: 700,
                        fontSize: "0.95rem"
                      }}
                    />
                  </MenuItem>
                </>
              )}
            </Box>
          </Menu>

          <SearchWrap>
            <Autocomplete
              freeSolo
              options={filteredBooks}
              filterOptions={(o) => o}
              getOptionLabel={(o) => (typeof o === "string" ? o : o.title || "")}
              ListboxProps={{ dir: "rtl", style: { textAlign: "right" } }}
              inputValue={search}
              onInputChange={(_, v) => setSearch(v)}
              onChange={(_, b) => {
                if (b && typeof b !== "string") {
                  navigate(`/books/${b.bookCode}`);
                  setSearch("");
                }
              }}
              noOptionsText={search ? "לא נמצאו ספרים" : "התחילו להקליד לחיפוש"}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    transition: "background .2s",
                    "&:hover": { backgroundColor: "#fbf5e8 !important" }
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1a2d4a" }}>
                      {option.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#7a6238" }}>
                      {option.author}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="חיפוש ספרים..."
                  size="small"
                  inputProps={{
                    ...params.inputProps,
                    dir: "rtl",
                    style: { textAlign: "right", ...(params.inputProps?.style || {}) }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      direction: "ltr",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,251,255,0.92) 100%)",
                      transition: "all .25s ease",
                      boxShadow: "inset 0 1px 2px rgba(45,116,186,0.06), 0 2px 10px rgba(31,93,153,0.06)",
                      fontFamily: '"Heebo", sans-serif',
                      "& fieldset": {
                        borderColor: "rgba(201,166,106,0.45)",
                        borderWidth: 1
                      },
                      "&:hover fieldset": { borderColor: "#b8956a" },
                      "&.Mui-focused": {
                        boxShadow:
                          "0 0 0 4px rgba(166,124,50,0.14), inset 0 1px 2px rgba(45,116,186,0.05)"
                      },
                      "&.Mui-focused fieldset": { borderColor: "#a67c32", borderWidth: 1.5 }
                    },
                    "& .MuiOutlinedInput-input": {
                      direction: "rtl",
                      textAlign: "right",
                      fontFamily: '"Heebo", sans-serif',
                      fontWeight: 500,
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      letterSpacing: "0.02em",
                      color: "#1a2d4a",
                      py: "10px",
                      "&::placeholder": {
                        color: "#5d7ea0",
                        opacity: 1,
                        fontWeight: 400,
                        fontStyle: "normal",
                        letterSpacing: "0.03em"
                      }
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start" sx={{ mr: 1, ml: 0.25 }}>
                          <SearchIcon sx={{ color: "#a67c32", fontSize: 22, opacity: 0.95 }} />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </SearchWrap>
        </Box>

        {/* Right: logo + site name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            flexShrink: 0,
            order: { xs: 1, md: 2 },
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "flex-end", md: "flex-start" }
          }}
        >
          <Box sx={{ textAlign: "right", minWidth: 0 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Frank Ruhl Libre", "David", serif',
                fontWeight: 900,
                fontSize: { xs: "1.15rem", sm: "1.4rem", md: "1.85rem" },
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                display: "block",
                background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 1px 0 rgba(255,255,255,0.4)"
              }}
            >
              פינת הקריאה שלי
            </Typography>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Heebo", sans-serif',
                fontSize: { xs: "0.7rem", sm: "0.78rem" },
                color: "#8b6914",
                letterSpacing: "0.18em",
                display: { xs: "none", sm: "block" },
                mt: 0.25
              }}
            >
              ספרייה דיגיטלית
            </Typography>
          </Box>

          <Box
            component="img"
            src="/images/logo.png"
            alt="לוגו"
            sx={{
              height: { xs: 48, sm: 60, md: 78 },
              width: "auto",
              maxWidth: 180,
              objectFit: "contain",
              display: "block",
              filter: "drop-shadow(0 4px 10px rgba(62,48,28,0.18))",
              transition: "transform .35s ease",
              "&:hover": { transform: "scale(1.05) rotate(-2deg)" }
            }}
          />
        </Box>
      </Toolbar>

      {/* Categories — RTL: first tab at visual right */}
      <Box
        dir="rtl"
        sx={{
          borderTop: "1px solid rgba(201,166,106,0.25)",
          background:
            "linear-gradient(180deg, rgba(255,253,248,0.6) 0%, rgba(250,244,232,0.4) 100%)",
          direction: "rtl"
        }}
      >
        <Tabs
          dir="rtl"
          value={Math.max(categories.indexOf(selectedCategory), 0)}
          onChange={(e, v) => {
            onCategorySelect(categories[v]);
            navigate({ pathname: "/", search: "" });
          }}
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            style: {
              background: "linear-gradient(90deg, #a67c32, #d4af6a)",
              height: 3,
              borderRadius: 3
            }
          }}
          sx={{
            minHeight: 52,
            direction: "rtl",
            "& .MuiTabs-flexContainer": { gap: 4 }
          }}
        >
          {categories.map((cat, i) => (
            <Tab
              key={i}
              label={cat === "all" ? "הכל" : cat}
              onMouseEnter={(e) => handleCategoryTabEnter(cat, e)}
              onMouseLeave={handleCategoryTabLeave}
              onClick={(e) => {
                if (pathname === "/" && selectedCategory === cat) {
                  scrollBooksHomeToTop();
                }
                if (cat !== "all") {
                  openSubjectsPanelNow(cat, e.currentTarget);
                } else {
                  clearSubjectsOpenTimer();
                  clearSubjectsCloseTimer();
                  setSubjectPopoverAnchor(null);
                  setPopoverCategory(null);
                }
              }}
              sx={{
                fontFamily: '"Heebo", sans-serif',
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#5a6578",
                minHeight: 52,
                textTransform: "none",
                transition: "all .2s ease",
                "&:hover": { color: "#8b6914", backgroundColor: "rgba(166,124,50,0.06)" },
                "&.Mui-selected": { color: "#1a2d4a", fontWeight: 700 }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Subjects panel — opens on hover over a category tab */}
      <Popover
        open={Boolean(subjectPopoverAnchor) && Boolean(popoverCategory)}
        anchorEl={subjectPopoverAnchor}
        onClose={() => {
          clearSubjectsOpenTimer();
          clearSubjectsCloseTimer();
          setSubjectPopoverAnchor(null);
          setPopoverCategory(null);
        }}
        disableRestoreFocus
        sx={{ zIndex: (t) => t.zIndex.modal + 2 }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            onMouseEnter: handleSubjectsPanelEnter,
            onMouseLeave: handleSubjectsPanelLeave,
            elevation: 0,
            sx: {
              mt: 0.75,
              width: { xs: "min(94vw, 520px)", sm: "min(92vw, 600px)" },
              maxWidth: 640,
              borderRadius: 3,
              overflow: "hidden",
              direction: "rtl",
              border: "1px solid rgba(201,166,106,0.45)",
              boxShadow: "0 18px 48px rgba(30, 47, 74, 0.14), 0 0 0 1px rgba(255,253,248,0.8) inset",
              background:
                "linear-gradient(165deg, rgba(255,253,248,0.98) 0%, rgba(250,244,232,0.96) 42%, rgba(245,251,255,0.94) 100%)"
            }
          }
        }}
      >
        <Box
          sx={{
            px: 2.25,
            py: 1.5,
            borderBottom: "1px solid rgba(201,166,106,0.28)",
            background: "linear-gradient(90deg, rgba(166,124,50,0.12) 0%, rgba(31,93,153,0.08) 55%, transparent 100%)"
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Frank Ruhl Libre", "David", serif',
              fontWeight: 800,
              fontSize: "1.05rem",
              letterSpacing: "0.02em",
              background: "linear-gradient(135deg, #1a2d4a 0%, #1f5d99 55%, #a67c32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textAlign: "right",
              lineHeight: 1.35
            }}
          >
            נושאים בקטגוריה
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.35,
              textAlign: "right",
              color: "#5d7ea0",
              fontFamily: '"Heebo", sans-serif',
              fontWeight: 600,
              fontSize: "0.88rem"
            }}
          >
            {popoverCategory}
          </Typography>
        </Box>

        <Box sx={{ p: 2, pt: 1.75 }}>
          {subjectsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#a67c32" }} />
            </Box>
          ) : subjectsForCategory.length === 0 ? (
            <Box
              sx={{
                py: 3,
                px: 2,
                borderRadius: 2.5,
                bgcolor: "rgba(31,93,153,0.04)",
                border: "1px dashed rgba(31,93,153,0.2)"
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#5d7ea0",
                  textAlign: "right",
                  fontStyle: "italic",
                  lineHeight: 1.65,
                  fontFamily: '"Heebo", sans-serif'
                }}
              >
                אין כאן נושאים שאושרו על ידי מנהל ושויכו במפורש לקטגוריה זו. נושאים חדשים מופיעים כאן רק אחרי אישור
                בעמוד &quot;אישור נושאים&quot; עם בחירת קטגוריה.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
                  sm: "repeat(auto-fill, minmax(148px, 1fr))"
                },
                gap: 1.25,
                maxHeight: { xs: 280, sm: 320 },
                overflowY: "auto",
                pr: 0.5,
                mr: -0.5,
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-track": { bgcolor: "rgba(219,234,249,0.5)", borderRadius: 99 },
                "&::-webkit-scrollbar-thumb": {
                  background: "linear-gradient(180deg, #d4af6a, #a67c32)",
                  borderRadius: 99,
                  border: "2px solid rgba(255,253,248,0.85)"
                }
              }}
            >
              {subjectsForCategory.map((s) => (
                <Chip
                  key={s.subjectCode}
                  label={s.name}
                  title={s.name}
                  clickable
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (popoverCategory) onCategorySelect(popoverCategory);
                    const q = new URLSearchParams({
                      subject: s.subjectCode,
                      subjectLabel: s.name || ""
                    });
                    navigate(`/?${q.toString()}`);
                    clearSubjectsOpenTimer();
                    clearSubjectsCloseTimer();
                    setSubjectPopoverAnchor(null);
                    setPopoverCategory(null);
                  }}
                  sx={{
                    cursor: "pointer",
                    height: "auto",
                    minHeight: 36,
                    py: 0.75,
                    px: 0.5,
                    justifyContent: "center",
                    fontFamily: '"Heebo", sans-serif',
                    fontWeight: 600,
                    fontSize: "0.84rem",
                    lineHeight: 1.35,
                    bgcolor: "rgba(255,254,250,0.95)",
                    color: "#1a2d4a",
                    border: "1px solid rgba(201,166,106,0.45)",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(62,48,28,0.06)",
                    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                      textAlign: "center",
                      display: "block",
                      px: 0.5
                    },
                    "&:hover": {
                      bgcolor: "#fffdf8",
                      borderColor: "#a67c32",
                      boxShadow: "0 6px 18px rgba(166,124,50,0.18)",
                      transform: "translateY(-1px)"
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Popover>
    </AppBar>
  );
}
