import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Alert, Container, Stack } from "@mui/material";
import BookCard from "./BookCard";
import { deleteFreeWriting, getAllFreeWriting } from "../services/freeWritingApi";
import { groupFreeWritingsBySeries, mapSeriesGroupToCatalogBook } from "../utils/freeWritingSeries";

const USER_BOOKS_FALLBACK_IMAGE = "https://placehold.co/600x800?text=User+Book";

const getLoggedInUserCode = () => {
  const rawCurrentUser = localStorage.getItem("currentUser");
  if (rawCurrentUser) {
    try {
      const parsed = JSON.parse(rawCurrentUser);
      if (parsed?.userCode) return parsed.userCode;
    } catch {
      // Keep checking other localStorage keys.
    }
  }

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      if (parsed?.userCode) return parsed.userCode;
    } catch {
      // Keep checking fallback key.
    }
  }

  return localStorage.getItem("userCode") || "";
};

export default function MyBooks() {
  const navigate = useNavigate();
  const [myBooks, setMyBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUserCode = useMemo(() => getLoggedInUserCode(), []);

  useEffect(() => {
    const loadMyBooks = async () => {
      if (!currentUserCode) {
        setError("לא נמצא משתמש מחובר. התחבר/י כדי לראות את הספרים שלך.");
        setLoading(false);
        return;
      }

      try {
        const freeWritingList = await getAllFreeWriting();
        const records = Array.isArray(freeWritingList) ? freeWritingList : [];
        const userRecords = records.filter((item) => item.userCode === currentUserCode);
        const groups = groupFreeWritingsBySeries(userRecords);
        const mappedBooks = groups.map((g) =>
          mapSeriesGroupToCatalogBook(g, USER_BOOKS_FALLBACK_IMAGE)
        );

        setMyBooks(mappedBooks);
      } catch (err) {
        setError(err?.message || "אירעה שגיאה בטעינת הספרים שלך.");
      } finally {
        setLoading(false);
      }
    };

    loadMyBooks();
  }, [currentUserCode]);

  const handleDeleteMyBook = async (book) => {
    if (!book?.bookCode) return;

    const codes =
      Array.isArray(book.seriesWritingCodes) && book.seriesWritingCodes.length
        ? book.seriesWritingCodes
        : [book.bookCode];

    if (book.chapterCount > 1) {
      const ok = window.confirm(
        `למחוק את הספר ואת כל ${book.chapterCount} הפרקים? פעולה זו אינה הפיכה.`
      );
      if (!ok) return;
    }

    try {
      for (const code of codes) {
        const response = await deleteFreeWriting(code);
        if (typeof response === "string" && response.toLowerCase().includes("error")) {
          setError("מחיקת הספר נכשלה. נסה/י שוב.");
          return;
        }
      }

      setMyBooks((prev) => prev.filter((item) => item.seriesKey !== book.seriesKey));
    } catch {
      setError("מחיקת הספר נכשלה. נסה/י שוב.");
    }
  };

  if (loading) {
    return (
      <Container maxWidth={false} sx={{ width: "100%", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Typography>טוען ספרים...</Typography>
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
      <Stack spacing={1} sx={{ mb: 3, width: "100%", direction: "rtl", textAlign: "right" }}>
        <Typography variant="h3" sx={{ color: "#1f5d99", fontWeight: 700, display: "block", width: "100%" }}>
          ספרים שכתבתי
        </Typography>
        <Typography sx={{ color: "#5d7ea0", display: "block", width: "100%", maxWidth: 720, lineHeight: 1.65 }}>
          כל הכתיבה האישית שלך מרוכזת במקום אחד.
        </Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : null}

      {!error && myBooks.length === 0 ? (
        <Alert severity="info">עדיין לא יצרת ספרים בכתיבה חופשית.</Alert>
      ) : null}

      <Box
        component="section"
        aria-label="ספרים שכתבתי"
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))"
          },
          gap: 3,
          alignItems: "stretch",
          mt: myBooks.length ? 1 : 0
        }}
      >
        {myBooks.map((book) => (
          <Box key={book.seriesKey || book.bookCode} sx={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <BookCard
              book={book}
              onDelete={handleDeleteMyBook}
              onEdit={(b) =>
                navigate(`/FreeWriting/edit/${encodeURIComponent(b.editWritingCode || b.bookCode)}`)
              }
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
