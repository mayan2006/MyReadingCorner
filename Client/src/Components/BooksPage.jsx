import { useEffect, useMemo, useRef } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalogPage } from "../services/booksApi";
import { queryKeys } from "../queryKeys";
import { Box, Container, Typography, Alert, Button, CircularProgress } from "@mui/material";
import ThreeBookCarousels, { GoldDivider } from "./ThreeBookCarousels";
import BookCarouselSection from "./BookCarouselSection";

const normalize = (value = "") => value.toString().trim().toLowerCase();
const USER_BOOKS_CATEGORY_NAME = "ספרי משתמשים";

const BooksPage = ({ selectedCategory }) => {
  const [searchParams] = useSearchParams();
  const subjectCodeFilter = (searchParams.get("subject") || "").trim();
  const subjectLabelParam = (searchParams.get("subjectLabel") || "").trim();
  const skipCategoryScrollOnce = useRef(true);

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalogPage
  });

  const books = data?.books || [];
  const categories = data?.categories || [];
  const userBooks = data?.userBooks || [];
  const popularBooks = data?.popularBooks || [];

  /** גלילה לראש בעת החלפת קטגוריה מה־Navbar (באותו נתיב / בלי לשנות URL) */
  useEffect(() => {
    if (skipCategoryScrollOnce.current) {
      skipCategoryScrollOnce.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [selectedCategory]);

  useEffect(() => {
    if (subjectCodeFilter) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [subjectCodeFilter]);

  const selectedCategoryCode =
    selectedCategory && selectedCategory !== "all"
      ? categories.find((cat) => normalize(cat.name) === normalize(selectedCategory))?.categoryCode
      : null;

  const filteredBooks = useMemo(() => {
    if (subjectCodeFilter) {
      const code = normalize(subjectCodeFilter);
      const merged = [...userBooks, ...books];
      return merged.filter((book) => normalize(book.subjectCode || "") === code);
    }
    if (selectedCategory === USER_BOOKS_CATEGORY_NAME) return userBooks;
    if (selectedCategory === "all") return books;
    return books.filter((book) => {
      const bookCategory = normalize(book.categoryCode);
      return (
        (selectedCategoryCode && bookCategory === normalize(selectedCategoryCode)) ||
        bookCategory === normalize(selectedCategory)
      );
    });
  }, [subjectCodeFilter, selectedCategory, selectedCategoryCode, userBooks, books]);

  const showSubjectBanner = Boolean(subjectCodeFilter);
  const showPopularRow =
    !subjectCodeFilter &&
    (selectedCategory === "all" || !selectedCategory) &&
    popularBooks.length > 0;

  const emptyListMessage = useMemo(() => {
    if (subjectCodeFilter) return "אין ספרים מקושרים לנושא זה כרגע.";
    if (selectedCategory === "all") return "אין ספרים בקטלוג כרגע.";
    return "אין ספרים להצגה בקטגוריה זו.";
  }, [subjectCodeFilter, selectedCategory]);

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }} role="status">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error" sx={{ direction: "rtl", textAlign: "right" }}>
          לא הצלחנו לטעון את הקטלוג. נסי לרענן את העמוד.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden", px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, boxSizing: "border-box" }}>
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
          px: 2,
          direction: "rtl"
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: '"Frank Ruhl Libre", "David", serif',
            fontWeight: 900,
            fontSize: { xs: "1.4rem", sm: "1.85rem", md: "2.1rem" },
            lineHeight: 1.1,
            letterSpacing: "0.01em",
            display: "block",
            background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            mb: 0.5
          }}
        >
          ספריה דיגיטלית
        </Typography>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Heebo", sans-serif',
            fontSize: { xs: "0.78rem", sm: "0.88rem" },
            color: "#8b6914",
            letterSpacing: "0.08em",
            display: "block",
            maxWidth: 760,
            mx: "auto",
            mt: 0.25,
            lineHeight: 1.65,
            fontWeight: 500
          }}
        >
          אוסף ספרים וכתיבה חופשית בעיצוב נקי, נעים ומסודר לקריאה.
        </Typography>
      </Box>

      {showSubjectBanner ? (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            direction: "rtl",
            textAlign: "right",
            border: "1px solid rgba(201,166,106,0.4)",
            background:
              "linear-gradient(135deg, rgba(255,253,248,0.95) 0%, rgba(245,251,255,0.9) 100%)",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5
          }}
        >
          <Typography sx={{ fontFamily: '"Heebo", sans-serif', fontWeight: 700, color: "#1f5d99", flex: "1 1 auto", textAlign: { xs: "center", sm: "right" } }}>
            ספרים בנושא: {subjectLabelParam || subjectCodeFilter}
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            size="small"
            variant="outlined"
            sx={{ borderColor: "#a67c32", color: "#5c3d0a", fontWeight: 700 }}
          >
            הצג את כל הספרים בקטגוריה
          </Button>
        </Box>
      ) : null}

      {showPopularRow ? (
        <Box sx={{ mb: 1 }}>
          <BookCarouselSection
            title="הכי אהובים בספריה"
            subtitle="הספרים שקיבלו הכי הרבה לייקים ודירוגים"
            books={popularBooks}
          />
          {filteredBooks.length > 0 ? <GoldDivider /> : null}
        </Box>
      ) : null}

      {filteredBooks.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3, direction: "rtl", textAlign: "right" }}>
          {emptyListMessage}
        </Alert>
      ) : (
        <ThreeBookCarousels books={filteredBooks} />
      )}
    </Container>
  );
};

export default BooksPage;