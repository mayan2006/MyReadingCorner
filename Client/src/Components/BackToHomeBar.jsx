import { Box, Button } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";

const pillButtonSx = {
  borderRadius: "999px",
  px: { xs: 2.25, sm: 2.75 },
  py: 1,
  textTransform: "none",
  fontFamily: '"Heebo", sans-serif',
  fontWeight: 700,
  fontSize: "0.95rem",
  letterSpacing: "0.02em",
  color: "#1a2d4a",
  border: "1px solid rgba(166,124,50,0.48)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,253,248,0.92) 100%)",
  boxShadow:
    "0 6px 18px rgba(62,48,28,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
  transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
  "& .MuiButton-startIcon": { mr: 0.85, ml: -0.25 },
  "&:hover": {
    borderColor: "#b89552",
    background:
      "linear-gradient(180deg, #ffffff 0%, rgba(250,243,229,0.98) 100%)",
    boxShadow:
      "0 10px 26px rgba(166,124,50,0.18), inset 0 1px 0 rgba(255,255,255,0.95)",
    transform: "translateY(-1px)",
    color: "#16375c"
  }
};

/** סרגל עליון מינימלי עם חזרה לבית — במקום Navbar בעמודים נבחרים */
export default function BackToHomeBar() {
  const navigate = useNavigate();

  const goBackInHistory = () => {
    navigate(-1);
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        width: "100%",
        borderBottom: "1px solid rgba(201,166,106,0.38)",
        background:
          "linear-gradient(180deg, rgba(253,252,249,0.98) 0%, rgba(247,241,231,0.96) 100%)",
        backdropFilter: "saturate(140%) blur(12px)",
        WebkitBackdropFilter: "saturate(140%) blur(12px)",
        boxShadow: "0 8px 24px rgba(62, 48, 28, 0.06)"
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 1.25, md: 1.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "stretch", sm: "flex-start" },
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          gap: { xs: 1, sm: 1.5 },
          direction: "rtl"
        }}
      >
        <Button
          type="button"
          disableElevation
          size="medium"
          fullWidth
          onClick={goBackInHistory}
          startIcon={<ArrowBackIosRoundedIcon sx={{ fontSize: 18 }} aria-hidden />}
          aria-label="חזרה לעמוד הקודם בהיסטוריה"
          sx={{ ...pillButtonSx, width: { xs: "100%", sm: "auto" } }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            חזרה לעמוד הקודם
          </Box>
          <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            חזרה
          </Box>
        </Button>

        <Button
          component={RouterLink}
          to="/"
          disableElevation
          size="medium"
          fullWidth
          startIcon={<HomeRoundedIcon sx={{ fontSize: 22 }} />}
          sx={{ ...pillButtonSx, width: { xs: "100%", sm: "auto" } }}
        >
          חזרה לדף הבית
        </Button>
      </Box>
    </Box>
  );
}
