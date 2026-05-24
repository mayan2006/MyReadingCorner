import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const linkSx = {
  fontFamily: '"Heebo", sans-serif',
  fontWeight: 600,
  fontSize: "0.8rem",
  color: "#2a4a6e",
  textDecoration: "none",
  letterSpacing: "0.02em",
  transition: "color .2s ease",
  "&:hover": {
    color: "#a67c32"
  }
};

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        width: "100%",
        borderTop: "1px solid rgba(201,166,106,0.42)",
        background:
          "linear-gradient(180deg, rgba(253,252,249,0.98) 0%, rgba(247,241,231,0.95) 38%, rgba(240,248,255,0.92) 100%)",
        boxShadow: "0 -6px 22px rgba(62, 48, 28, 0.05)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 3,
          borderRadius: "0 0 99px 99px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212,175,106,0.5) 12%, #d4af6a 35%, #a67c32 50%, #d4af6a 65%, rgba(212,175,106,0.5) 88%, transparent 100%)",
          opacity: 0.95
        }
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 2, pb: 1.25, px: { xs: 2, md: 3 } }}>
        <Stack
          spacing={1.25}
          sx={{
            alignItems: "center",
            direction: "rtl",
            textAlign: "center",
            width: "100%"
          }}
        >
          <Box sx={{ maxWidth: 520 }}>
            <Typography
              component="span"
              sx={{
                fontFamily: '"Frank Ruhl Libre", "David", serif',
                fontWeight: 900,
                fontSize: { xs: "1.05rem", sm: "1.2rem" },
                lineHeight: 1.15,
                letterSpacing: "0.01em",
                display: "block",
                background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.35
              }}
            >
              פינת הקריאה שלי
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Heebo", sans-serif',
                fontSize: "0.68rem",
                letterSpacing: "0.14em",
                color: "#8b6914",
                fontWeight: 600,
                display: "block",
                mb: 0
              }}
            >
              ספרייה דיגיטלית
            </Typography>
          </Box>

          <Box sx={{ width: "100%", maxWidth: "100%" }}>
            <Typography
              sx={{
                fontFamily: '"Heebo", sans-serif',
                fontWeight: 800,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                color: "#1f5d99",
                mb: 0.5,
                textAlign: "center",
                width: "100%"
              }}
            >
              ניווט מהיר
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "center",
                alignItems: "center",
                gap: { xs: 1, sm: 1.35, md: 1.75 },
                direction: "rtl",
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                py: 0.25,
                px: { xs: 0.5, sm: 0.75 },
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { height: 6 },
                "&::-webkit-scrollbar-thumb": {
                  background: "linear-gradient(90deg, #d4af6a, #a67c32)",
                  borderRadius: 99
                }
              }}
            >
              <Link component={RouterLink} to="/" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                דף הבית
              </Link>
              <Link component={RouterLink} to="/FreeWriting" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                כתיבה חופשית
              </Link>
              <Link component={RouterLink} to="/favorites" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                ספרים אהובים
              </Link>
              <Link component={RouterLink} to="/later" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                לקריאה בהמשך
              </Link>
              <Link component={RouterLink} to="/my-books" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                ספרים שכתבתי
              </Link>
              <Link component={RouterLink} to="/Profile" sx={{ ...linkSx, whiteSpace: "nowrap", flexShrink: 0 }}>
                פרופיל
              </Link>
            </Box>
          </Box>
        </Stack>

        <Divider
          sx={{
            my: 1.5,
            borderColor: "rgba(201,166,106,0.35)",
            background:
              "linear-gradient(90deg, transparent, rgba(166,124,50,0.25), transparent)",
            height: 1
          }}
        />

        <Typography
          component="p"
          sx={{
            fontFamily: '"Heebo", sans-serif',
            fontSize: "0.68rem",
            color: "#7a93b0",
            textAlign: "center",
            letterSpacing: "0.03em",
            lineHeight: 1.35,
            pb: 0.25
          }}
        >
          © {year} פינת הקריאה שלי · כל הזכויות שמורות
        </Typography>
      </Container>
    </Box>
  );
}
