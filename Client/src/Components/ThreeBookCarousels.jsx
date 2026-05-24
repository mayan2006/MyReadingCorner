import { Box } from "@mui/material";
import BookCarouselSection from "./BookCarouselSection";

/** חלוקה לשלוש שורות קרוסלה (כמעט שווה) */
export const splitBooksIntoThree = (arr) => {
  const list = Array.isArray(arr) ? arr : [];
  const len = list.length;
  if (len === 0) return [[], [], []];
  const size = Math.ceil(len / 3);
  return [list.slice(0, size), list.slice(size, size * 2), list.slice(size * 2)];
};

export const CAROUSEL_SECTION_META = [
  {
    title: "ברגע זה בולטים",
    subtitle: "מבחר ראשון מהאוסף — גללו עם החיצים לצפייה בכל הכותרות"
  },
  {
    title: "ממשיכים לדפדף",
    subtitle: "עוד ספרים מהקטלוג באותו סגנון נעים לעין"
  },
  {
    title: "עוד מהמדף הדיגיטלי",
    subtitle: "להמשך גילוי וקריאה נעימה"
  }
];

export const GoldDivider = () => (
  <Box
    role="separator"
    aria-hidden
    sx={{
      position: "relative",
      my: { xs: 3.25, md: 4.25 },
      mx: "auto",
      maxWidth: "min(92vw, 920px)",
      height: 5,
      borderRadius: 99,
      background:
        "linear-gradient(90deg, transparent 0%, rgba(212,175,106,0.45) 6%, #e8d5a8 18%, #d4af6a 38%, #a67c32 50%, #d4af6a 62%, #e8d5a8 82%, rgba(212,175,106,0.45) 94%, transparent 100%)",
      boxShadow:
        "0 3px 18px rgba(166,124,50,0.28), inset 0 1px 0 rgba(255,255,255,0.5)",
      "&::after": {
        content: '""',
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(240px, 40%)",
        height: 2,
        borderRadius: 99,
        bgcolor: "rgba(255,253,248,0.55)",
        opacity: 0.85
      }
    }}
  />
);

/**
 * שלוש שורות קרוסלה עם חיצים ומפרידים זהובים — כמו בדף הבית.
 * @param {{ books: unknown[]; bookCardProps?: Record<string, unknown> }} props
 */
export default function ThreeBookCarousels({ books, bookCardProps = {} }) {
  if (!books?.length) return null;
  const chunks = splitBooksIntoThree(books);
  const rows = CAROUSEL_SECTION_META.map((meta, i) => ({
    ...meta,
    books: chunks[i]
  })).filter((row) => row.books.length > 0);

  return (
    <Box sx={{ width: "100%", overflowX: "hidden" }}>
      {rows.map((row, index) => (
        <Box key={`${row.title}-${index}`}>
          <BookCarouselSection
            title={row.title}
            subtitle={row.subtitle}
            books={row.books}
            bookCardProps={bookCardProps}
          />
          {index < rows.length - 1 ? <GoldDivider /> : null}
        </Box>
      ))}
    </Box>
  );
}
