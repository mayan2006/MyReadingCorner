import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Alert, Container } from "@mui/material";
import axios from "axios";
import BookCard from "./BookCard";
import { getAllMarkedBook } from "../services/markedBookApi";
import { getAllFreeWriting } from "../services/freeWritingApi";
import { API_BASE_URL } from "../services/apiBase";
import {
  mapSeriesGroupToCatalogBook,
  seriesKeyForWriting,
  sortChaptersAsc
} from "../utils/freeWritingSeries";

const USER_BOOKS_FALLBACK_IMAGE = "https://placehold.co/600x800?text=User+Book";

const getLoggedInUserCode = () => {
  const rawCurrentUser = localStorage.getItem("currentUser");
  if (rawCurrentUser) {
    try {
      const parsed = JSON.parse(rawCurrentUser);
      if (parsed?.userCode) return parsed.userCode;
    } catch {
      // Ignore malformed local data and continue fallback flow.
    }
  }

  return localStorage.getItem("userCode") || "";
};

export default function LaterBooks() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUserCode = useMemo(() => getLoggedInUserCode(), []);

  useEffect(() => {
    const loadLaterBooks = async () => {
      if (!currentUserCode) {
        setError("לא נמצא משתמש מחובר. התחבר/י כדי לראות רשימת קריאה.");
        setLoading(false);
        return;
      }

      try {
        const [markedRes, booksRes, freeWritingRes] = await Promise.all([
          getAllMarkedBook(),
          axios.get(`${API_BASE_URL}/books`),
          getAllFreeWriting()
        ]);

        const marked = Array.isArray(markedRes) ? markedRes : [];
        const allBooks = Array.isArray(booksRes?.data) ? booksRes.data : [];
        const freeWriting = Array.isArray(freeWritingRes) ? freeWritingRes : [];

        const userLater = marked.filter(
          (item) => item.userCode === currentUserCode && item.bookStatus === "later"
        );

        const seenFwSeries = new Set();
        const seenCatalogCode = new Set();
        const merged = [];

        for (const item of userLater) {
          const fwHit = freeWriting.find((writing) => writing.writingCode === item.bookCode);
          if (fwHit) {
            const sk = seriesKeyForWriting(fwHit);
            if (seenFwSeries.has(sk)) continue;
            seenFwSeries.add(sk);
            const chapters = freeWriting
              .filter((w) => seriesKeyForWriting(w) === sk)
              .sort(sortChaptersAsc);
            const group = {
              seriesKey: sk,
              chapters,
              first: chapters[0],
              last: chapters[chapters.length - 1],
              chapterCount: chapters.length
            };
            merged.push(mapSeriesGroupToCatalogBook(group, USER_BOOKS_FALLBACK_IMAGE));
            continue;
          }

          const normalBook = allBooks.find((b) => b.bookCode === item.bookCode);
          if (normalBook) {
            if (seenCatalogCode.has(normalBook.bookCode)) continue;
            seenCatalogCode.add(normalBook.bookCode);
            merged.push(normalBook);
            continue;
          }

          if (seenCatalogCode.has(item.bookCode)) continue;
          seenCatalogCode.add(item.bookCode);
          merged.push({
            bookCode: item.bookCode,
            title: item.name || "ספר שמור",
            author: "לא זמין",
            summary: "לא נמצאו פרטי ספר מלאים.",
            img: USER_BOOKS_FALLBACK_IMAGE,
            content: ""
          });
        }

        setBooks(merged);
      } catch (err) {
        setError(err?.message || "אירעה שגיאה בטעינת רשימת הקריאה.");
      } finally {
        setLoading(false);
      }
    };

    loadLaterBooks();
  }, [currentUserCode]);

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ width: "100%", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Typography>טוען רשימת קריאה...</Typography>
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
          לקריאה בהמשך
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
          הספרים שסימנת לשוב אליהם מאוחר יותר.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!error && books.length === 0 ? (
        <Alert severity="info">עדיין לא שמרת ספרים לקריאה בהמשך.</Alert>
      ) : null}

      <Box
        component="section"
        aria-label="רשימת קריאה בהמשך"
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
          },
          gap: 3,
          alignItems: "stretch",
          mt: books.length ? 1 : 0
        }}
      >
        {books.map((book) => (
          <Box key={book.seriesKey || book.bookCode} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <BookCard book={book} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
