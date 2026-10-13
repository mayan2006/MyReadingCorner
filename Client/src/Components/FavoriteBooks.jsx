import { Box, Typography, Alert, Container, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import BookCard from "./BookCard";
import { getMyLikedBooks } from "../services/bookLikeApi";
import { queryKeys } from "../queryKeys";
import { useAuth } from "../context/AuthContext.jsx";

export default function FavoriteBooks() {
  const { currentUser } = useAuth();
  const currentUserCode = currentUser?.userCode || "";

  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.myLikedBooks,
    queryFn: async () => {
      const result = await getMyLikedBooks();
      if (!Array.isArray(result)) {
        throw new Error(result?.message || "שגיאה בטעינת הרשימה");
      }
      return result;
    },
    enabled: Boolean(currentUserCode)
  });

  const books = data || [];

  if (!currentUserCode) {
    return (
      <Container maxWidth={false} sx={{ width: "100%", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Alert severity="warning">לא נמצא משתמש מחובר. התחבר/י כדי לראות את ספרים אהובים.</Alert>
      </Container>
    );
  }

  if (isPending) {
    return (
      <Container maxWidth={false} sx={{ width: "100%", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }} role="status">
          <CircularProgress />
        </Box>
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

      {isError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || "שגיאה בטעינת הרשימה"}
        </Alert>
      ) : null}

      {!isError && books.length === 0 ? (
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
            <BookCard book={book} />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
