import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography, Alert, Container } from "@mui/material";
import BookCard from "./BookCard";
import { getLikedBooksForUser } from "../services/bookLikeApi";

const getLoggedInUserCode = () => {
  const rawCurrentUser = localStorage.getItem("currentUser");
  if (rawCurrentUser) {
    try {
      const parsed = JSON.parse(rawCurrentUser);
      if (parsed?.userCode) return parsed.userCode;
    } catch {
      return localStorage.getItem("userCode") || "";
    }
  }
  return localStorage.getItem("userCode") || "";
};

export default function FavoriteBooks() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUserCode = useMemo(() => getLoggedInUserCode(), []);

  const loadBooks = useCallback(async () => {
    if (!currentUserCode) {
      setError("לא נמצא משתמש מחובר. התחבר/י כדי לראות את ספרים אהובים.");
      setBooks([]);
      setLoading(false);
      return;
    }
    setError("");
    try {
      const data = await getLikedBooksForUser(currentUserCode);
      if (Array.isArray(data)) {
        setBooks(data);
      } else if (data?.message) {
        setError(typeof data.message === "string" ? data.message : "שגיאה בטעינת הרשימה");
      } else {
        setError("שגיאה בטעינת הרשימה");
      }
    } catch (e) {
      setError(e?.message || "שגיאה בטעינת הרשימה");
    } finally {
      setLoading(false);
    }
  }, [currentUserCode]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ width: "100%", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Typography>טוען ספרים אהובים...</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        boxSizing: "border-box"
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          px: 2,
          direction: "rtl",
          width: "100%"
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"Frank Ruhl Libre", "David", serif',
            fontWeight: 900,
            fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2rem" },
            lineHeight: 1.15,
            letterSpacing: "0.01em",
            display: "block",
            background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            mb: 0.75
          }}
        >
          ספרים אהובים
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Heebo", sans-serif',
            fontSize: { xs: "0.78rem", sm: "0.88rem" },
            color: "#8b6914",
            letterSpacing: "0.08em",
            display: "block",
            maxWidth: 720,
            mx: "auto",
            mt: 0.35,
            lineHeight: 1.65,
            fontWeight: 500
          }}
        >
          ספרים שסימנת בלייק — אותם ניתן להסיר בלחיצה שוב על הלב בכרטיס או בדף הספר.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!error && books.length === 0 ? (
        <Alert severity="info">עדיין לא סימנת ספרים בלייק. לחצו על הלב בכרטיס הספר או בדף הקריאה.</Alert>
      ) : null}

      <Box
        component="section"
        aria-label="רשימת ספרים אהובים"
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
          },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
          mt: books.length ? 1 : 0
        }}
      >
        {books.map((book) => (
          <Box key={book.bookCode} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <BookCard book={book} onLikeChange={loadBooks} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
