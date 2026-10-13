import { Box, CircularProgress, Typography } from "@mui/material";

export default function PageFallback() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography sx={{ color: "#5c4a38" }}>טוען עמוד...</Typography>
    </Box>
  );
}
