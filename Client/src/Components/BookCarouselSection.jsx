import { useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import BookCard from "./BookCard";

const CARD_WIDTH_PX = 280;

const sideArrowSx = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  border: "1px solid rgba(166,124,50,0.55)",
  bgcolor: "rgba(255,253,248,0.94)",
  color: "#8b6914",
  boxShadow: "0 4px 18px rgba(62,48,28,0.12)",
  backdropFilter: "blur(6px)",
  "&:hover": {
    bgcolor: "rgba(255,253,248,1)",
    borderColor: "#a67c32",
    color: "#5c4a38",
    boxShadow: "0 6px 22px rgba(166,124,50,0.22)"
  }
};

export default function BookCarouselSection({ title, subtitle, books, bookCardProps = {} }) {
  const scrollerRef = useRef(null);

  const scrollByDirection = (directionSign) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild;
    const cardW = firstCard?.getBoundingClientRect().width || CARD_WIDTH_PX;
    const gap = 20;
    el.scrollBy({ left: directionSign * (cardW + gap), behavior: "smooth" });
  };

  if (!books?.length) return null;

  return (
    <Box component="section" sx={{ mb: 0.5 }}>
      <Box
        sx={{
          mb: 2,
          px: { xs: 0.25, md: 0.5 },
          direction: "rtl",
          textAlign: "right"
        }}
      >
        <Box sx={{ width: "100%", textAlign: "right" }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Frank Ruhl Libre", "David", serif',
              fontWeight: 800,
              fontSize: { xs: "1.2rem", sm: "1.35rem" },
              lineHeight: 1.25,
              background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 55%, #a67c32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              mb: subtitle ? 0.35 : 0
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Heebo", sans-serif',
                color: "#5d7ea0",
                fontWeight: 500,
                lineHeight: 1.5,
                maxWidth: 560
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ position: "relative", px: { xs: 0.25, md: 0.5 } }}>
        <IconButton
          size="medium"
          aria-label="גלילה שמאלה — הספרים הקודמים"
          onClick={() => scrollByDirection(-1)}
          sx={{
            ...sideArrowSx,
            left: { xs: 4, sm: 8 }
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          size="medium"
          aria-label="גלילה ימינה — הספרים הבאים"
          onClick={() => scrollByDirection(1)}
          sx={{
            ...sideArrowSx,
            right: { xs: 4, sm: 8 }
          }}
        >
          <ChevronRight />
        </IconButton>

        <Box
          aria-label={title}
          ref={scrollerRef}
          sx={{
            direction: "ltr",
            overflowX: "auto",
            overflowY: "hidden",
            display: "flex",
            gap: 2.5,
            py: 1,
            px: { xs: 5.5, sm: 6.5 },
            scrollSnapType: "x proximity",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": { height: 8 },
            "&::-webkit-scrollbar-track": {
              bgcolor: "rgba(219,234,249,0.6)",
              borderRadius: 99
            },
            "&::-webkit-scrollbar-thumb": {
              background: "linear-gradient(90deg, #d4af6a, #a67c32)",
              borderRadius: 99,
              border: "2px solid rgba(255,253,248,0.85)"
            }
          }}
        >
          {books.map((book) => (
            <Box
              key={book.seriesKey || book.bookCode}
              sx={{
                width: { xs: "min(85vw, 280px)", sm: CARD_WIDTH_PX },
                maxWidth: "85vw",
                flexShrink: 0,
                minWidth: 0,
                scrollSnapAlign: "start"
              }}
            >
              <BookCard book={book} {...bookCardProps} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
