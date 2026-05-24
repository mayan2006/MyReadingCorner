import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from "@mui/material";
import BookCard from "./BookCard";
import { getPublicAuthorProfile } from "../services/UserAPI";
import { API_BASE_URL } from "../services/apiBase";

const booksGridSx = {
  display: "grid",
  width: "100%",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
  },
  gap: 3,
  alignItems: "stretch"
};

export default function AuthorProfile() {
  const { userCode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await getPublicAuthorProfile(userCode);
      if (cancelled) return;
      if (res?.user && Array.isArray(res.writtenBooks) && Array.isArray(res.likedBooks)) {
        setData(res);
      } else if (res?.message) {
        setError(typeof res.message === "string" ? res.message : "לא ניתן לטעון את הפרופיל");
      } else {
        setError("לא ניתן לטעון את הפרופיל");
      }
      setLoading(false);
    };
    if (userCode) load();
    return () => {
      cancelled = true;
    };
  }, [userCode]);

  if (loading) {
    return (
      <Box dir="rtl" sx={{ display: "flex", justifyContent: "center", py: 8, direction: "rtl" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.user) {
    return (
      <Container maxWidth="sm" dir="rtl" sx={{ py: 6, direction: "rtl", textAlign: "right" }}>
        <Alert severity="error">{error || "משתמש לא נמצא"}</Alert>
      </Container>
    );
  }

  const { user, writtenBooks, likedBooks } = data;
  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userCode;
  const avatarSrc = user.img
    ? user.img.startsWith("http")
      ? user.img
      : `${API_BASE_URL}${user.img}`
    : "";

  return (
    <Box
      dir="rtl"
      sx={{
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 3 },
        minHeight: "70vh",
        direction: "rtl",
        textAlign: "right",
        overflowX: "hidden",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top, rgba(116, 183, 255, 0.15), transparent 30%), linear-gradient(180deg, #f5fbff 0%, #e7f3ff 100%)"
      }}
    >
      <Container maxWidth="lg" sx={{ direction: "rtl" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 3,
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            border: "1px solid #d7e7f7",
            bgcolor: "rgba(255,255,255,0.92)",
            boxShadow: "0 12px 32px rgba(45, 116, 186, 0.08)",
            textAlign: "right"
          }}
        >
          <Avatar
            src={avatarSrc || undefined}
            alt=""
            sx={{
              width: 120,
              height: 120,
              fontSize: "2.5rem",
              bgcolor: "#1f5d99",
              border: "3px solid #dbeaf9"
            }}
          >
            {!avatarSrc ? displayName.charAt(0) : null}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, textAlign: "right", width: "100%" }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1f5d99", mb: 0.5, textAlign: "right" }}>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#5d7ea0", textAlign: "right" }}>
              כותב/ת באתר · פרופיל ציבורי
            </Typography>
            <Typography variant="caption" sx={{ color: "#7a92ab", display: "block", mt: 1, textAlign: "right", lineHeight: 1.6 }}>
              מוצגים ספרים שכתב/ה וספרים שסימן/ה בלייק. רשימת &quot;לקריאה בהמשך&quot; אינה ציבורית.
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f5d99", mb: 2, textAlign: "right", width: "100%" }}>
          ספרים שכתב/ה
        </Typography>
        {writtenBooks.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4, textAlign: "right" }}>
            אין עדיין כתיבות שפורסמו מחשבון זה.
          </Alert>
        ) : (
          <Box component="section" aria-label="ספרים שכתב המחבר" sx={{ ...booksGridSx, mb: 5 }}>
            {writtenBooks.map((book) => (
              <Box key={book.seriesKey || book.bookCode} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <BookCard book={book} />
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f5d99", mb: 1, textAlign: "right", width: "100%" }}>
          ספרים שאהב/ה
        </Typography>
        <Typography variant="body2" sx={{ color: "#5d7ea0", mb: 2, textAlign: "right", width: "100%", maxWidth: 720 }}>
          ספרים שלחצו עליהם &quot;אהבתי&quot; בפרופיל הציבורי.
        </Typography>
        {likedBooks.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: "right" }}>
            אין עדיין לייקים להצגה.
          </Alert>
        ) : (
          <Box component="section" aria-label="ספרים שאהב המחבר" sx={booksGridSx}>
            {likedBooks.map((book) => (
              <Box key={`liked-${book.bookCode}`} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <BookCard book={book} />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
