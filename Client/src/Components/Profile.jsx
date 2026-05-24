import { useEffect, useRef, useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, IconButton,
  Avatar, Alert, Chip, Tooltip, CircularProgress, Fade
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EditIcon from "@mui/icons-material/Edit";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useNavigate } from "react-router-dom";
import { getAllUsers, uploadUserImage } from "../services/UserAPI";
import { API_BASE_URL } from "../services/apiBase";
import { useSiteBackground } from "../context/SiteBackgroundContext.jsx";

export default function Profile() {
  const navigate = useNavigate();
  const { darkBg, toggleDarkBg } = useSiteBackground();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem("currentUser") || localStorage.getItem("user");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });

  const items = [
    { title: "ספרים אהובים", path: "/favorites", icon: <FavoriteRoundedIcon />, hue: "#ff6b9a", desc: "הספרים שאהבת במיוחד" },
    { title: "כתיבה חופשית", path: "/FreeWriting", icon: <EditNoteRoundedIcon />, hue: "#7c5cff", desc: "המקום שלך ליצירה" },
    {
      title: "ספרים שכתבתי",
      path: "/my-books",
      icon: <MenuBookRoundedIcon />,
      hue: "#1f9d8a",
      desc: "כל היצירות שלך — בכרטיס כל ספר לחצו על עריכה כדי להמשיך לכתוב"
    },
    { title: "לקריאה בהמשך", path: "/later", icon: <BookmarkRoundedIcon />, hue: "#f0a73a", desc: "רשימת הקריאה שלך" },
    ...(currentUser?.role === "manager"
      ? [{ title: "אישור נושאים (מנהל)", path: "/manager/subjects", icon: <VerifiedRoundedIcon />, hue: "#1f5d99", desc: "ניהול נושאים חדשים" }]
      : [])
  ];

  useEffect(() => {
    const syncUserFromDb = async () => {
      if (!currentUser?.userCode) return;
      const users = await getAllUsers();
      if (!Array.isArray(users)) return;
      const freshUser = users.find((u) => u.userCode === currentUser.userCode);
      if (!freshUser) return;
      const { password: _p, ...safeUser } = freshUser;
      setCurrentUser(safeUser);
      localStorage.setItem("currentUser", JSON.stringify(safeUser));
      window.dispatchEvent(new CustomEvent("library-current-user-updated"));
    };
    syncUserFromDb();
  }, [currentUser?.userCode]);

  const profileImageSrc = currentUser?.img
    ? currentUser.img.startsWith("http") ? currentUser.img : `${API_BASE_URL}${currentUser.img}`
    : "";

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!currentUser?.userCode) { setUploadError("לא נמצא משתמש מחובר."); return; }
    setUploadMessage(""); setUploadError(""); setIsUploading(true);
    try {
      const response = await uploadUserImage(currentUser.userCode, file);
      if (response?.user) {
        const { password: _p, ...safeUser } = response.user;
        setCurrentUser(safeUser);
        localStorage.setItem("currentUser", JSON.stringify(safeUser));
        window.dispatchEvent(new CustomEvent("library-current-user-updated"));
        setUploadMessage("תמונת הפרופיל עודכנה בהצלחה.");
      } else {
        setUploadError(response?.message || "העלאת התמונה נכשלה.");
      }
    } catch (err) {
      setUploadError(err?.message || "העלאת התמונה נכשלה.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const initials = (currentUser?.firstName?.[0] || currentUser?.userName?.[0] || "?").toUpperCase();
  const displayName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName ?? ""}`.trim()
    : currentUser?.userName || "ברוך הבא";

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: "100vh",
        background: darkBg
          ? "radial-gradient(900px 420px at 85% 0%, rgba(60,70,95,0.25), transparent 55%), linear-gradient(180deg, #18181e 0%, #121218 100%)"
          : "radial-gradient(1200px 600px at 80% -10%, #dbeaff 0%, transparent 60%), radial-gradient(900px 500px at 0% 10%, #ffe5ef 0%, transparent 55%), linear-gradient(180deg, #f7faff 0%, #eef4ff 100%)",
        py: { xs: 4, md: 7 },
        px: { xs: 2, md: 4 },
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        {/* Hero card */}
        <Card
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 6,
            p: { xs: 3, md: 5 },
            mb: 5,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(245,250,255,0.85) 100%)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(31, 93, 153, 0.12)",
            boxShadow: "0 30px 60px -25px rgba(31, 93, 153, 0.35)",
          }}
        >
          <Box
            sx={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background:
                "radial-gradient(600px 200px at 100% 0%, rgba(124,92,255,0.18), transparent 60%), radial-gradient(500px 200px at 0% 100%, rgba(255,107,154,0.18), transparent 60%)",
            }}
          />
          <Box sx={{ position: "relative", display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: { xs: 3, md: 5 } }}>
            {/* Avatar with upload ring */}
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  p: "4px",
                  borderRadius: "50%",
                  background: "conic-gradient(from 180deg at 50% 50%, #7c5cff, #1f5d99, #ff6b9a, #7c5cff)",
                  boxShadow: "0 10px 30px rgba(31,93,153,0.25)",
                }}
              >
                <Avatar
                  src={profileImageSrc}
                  sx={{
                    width: { xs: 110, md: 140 }, height: { xs: 110, md: 140 },
                    border: "4px solid #fff", fontSize: 42, fontWeight: 700,
                    bgcolor: "#1f5d99", color: "#fff",
                  }}
                >
                  {initials}
                </Avatar>
              </Box>
              <Tooltip title="החלפת תמונת פרופיל" arrow>
                <IconButton
                  onClick={handlePickImage}
                  disabled={isUploading}
                  sx={{
                    position: "absolute", bottom: 4, insetInlineEnd: 4,
                    width: 40, height: 40,
                    bgcolor: "#1f5d99", color: "#fff",
                    boxShadow: "0 8px 20px rgba(31,93,153,0.45)",
                    "&:hover": { bgcolor: "#17487a" },
                  }}
                >
                  {isUploading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <PhotoCameraRoundedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </Box>

            {/* Title + meta */}
            <Box sx={{ textAlign: "right", flex: 1 }}>
              <Typography sx={{ color: "#7c8ea8", fontWeight: 600, letterSpacing: 1, fontSize: 13, mb: 0.5 }}>
                הפרופיל שלי
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800, lineHeight: 1.15,
                  fontSize: { xs: "1.45rem", sm: "1.85rem", md: "2.125rem" },
                  background: "linear-gradient(90deg, #1f5d99 0%, #7c5cff 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                שלום, {displayName} 👋
              </Typography>
              <Typography sx={{ color: "#5d7ea0", maxWidth: 520, mb: 2 }}>
                כל הספרים, הכתיבה והרשימות שלך — במקום אחד, בעיצוב נקי ונעים.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.75,
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <Tooltip title={darkBg ? "כיבוי רקע כהה" : "רקע כהה עדין לאתר"} arrow>
                  <IconButton
                    type="button"
                    size="small"
                    onClick={toggleDarkBg}
                    aria-pressed={darkBg}
                    aria-label={darkBg ? "כיבוי רקע כהה" : "הפעלת רקע כהה לאתר"}
                    sx={{
                      boxSizing: "border-box",
                      height: 32,
                      width: "auto",
                      minWidth: 0,
                      px: 1.25,
                      py: 0,
                      border: "1px solid",
                      borderColor: darkBg ? "rgba(212,175,106,0.55)" : "rgba(31,93,153,0.2)",
                      bgcolor: darkBg ? "rgba(166,124,50,0.12)" : "rgba(255,255,255,0.75)",
                      borderRadius: 999,
                      transition: "all .2s ease",
                      "&:hover": {
                        bgcolor: darkBg ? "rgba(166,124,50,0.2)" : "rgba(31,93,153,0.08)",
                        borderColor: darkBg ? "#d4af6a" : "rgba(31,93,153,0.35)",
                      },
                    }}
                  >
                    <ToggleOnIcon
                      sx={{
                        fontSize: 20,
                        color: darkBg ? "#d4af6a" : "#7a8fa8",
                        filter: darkBg ? "drop-shadow(0 0 6px rgba(212,175,106,0.35))" : "none",
                      }}
                    />
                  </IconButton>
                </Tooltip>
                {currentUser?.role && (
                  <Chip
                    label={currentUser.role === "manager" ? "מנהל" : "קוראת/קורא"}
                    sx={{
                      height: 32,
                      boxSizing: "border-box",
                      maxWidth: "100%",
                      bgcolor: "#eef3ff",
                      color: "#1f5d99",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      "& .MuiChip-label": {
                        px: 1.25,
                        py: 0,
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: { xs: "72vw", sm: 280 }
                      },
                    }}
                  >
                  </Chip>
                )}
                {currentUser?.email && (
                  <Chip
                    label={currentUser.email}
                    variant="outlined"
                    sx={{
                      height: 32,
                      boxSizing: "border-box",
                      maxWidth: "100%",
                      borderColor: "#d7e7f7",
                      color: "#5d7ea0",
                      fontSize: "0.8125rem",
                      "& .MuiChip-label": {
                        px: 1.25,
                        py: 0,
                        lineHeight: 1.2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: { xs: "72vw", sm: 320 }
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Alerts */}
        <Fade in={!!uploadMessage}>
          <Box>{uploadMessage && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{uploadMessage}</Alert>}</Box>
        </Fade>
        <Fade in={!!uploadError}>
          <Box>{uploadError && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{uploadError}</Alert>}</Box>
        </Fade>

        {/* Tiles */}
        <Grid container spacing={3} justifyContent="flex-start">
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                onClick={() => navigate(item.path)}
                elevation={0}
                sx={{
                  position: "relative", overflow: "hidden",
                  height: { xs: 180, sm: 200 }, cursor: "pointer", borderRadius: 5,
                  border: "1px solid rgba(31,93,153,0.10)",
                  background: "linear-gradient(180deg, #ffffff 0%, #f6faff 100%)",
                  boxShadow: "0 14px 30px -18px rgba(31,93,153,0.45)",
                  transition: "transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s",
                  "&::before": {
                    content: '""', position: "absolute", top: -40, insetInlineEnd: -40,
                    width: 140, height: 140, borderRadius: "50%",
                    background: `radial-gradient(circle, ${item.hue}33 0%, transparent 70%)`,
                    transition: "transform .5s",
                  },
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: `0 26px 50px -20px ${item.hue}66`,
                  },
                  "&:hover::before": { transform: "scale(1.4)" },
                }}
              >
                <CardContent sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 3 }}>
                  <Box
                    sx={{
                      width: 52, height: 52, borderRadius: "16px",
                      display: "grid", placeItems: "center",
                      color: "#fff",
                      background: `linear-gradient(135deg, ${item.hue} 0%, ${item.hue}cc 100%)`,
                      boxShadow: `0 10px 22px -8px ${item.hue}aa`,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                      {item.path === "/my-books" ? (
                        <EditIcon sx={{ fontSize: 22, color: item.hue }} aria-hidden />
                      ) : null}
                      <Typography variant="h6" sx={{ color: "#1f3a5f", fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#6b819b" }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
