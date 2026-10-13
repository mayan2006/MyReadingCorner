import { Component } from "react";
import { Box, Button, Typography } from "@mui/material";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        dir="rtl"
        role="alert"
        sx={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 3,
          textAlign: "center"
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#1a2d4a" }}>
          משהו השתבש
        </Typography>
        <Typography sx={{ color: "#5c4a38", maxWidth: 420 }}>
          העמוד נתקל בשגיאה. אפשר לחזור לדף הבית ולהמשיך משם.
        </Typography>
        <Button variant="contained" onClick={this.handleReload}>
          חזרה לדף הבית
        </Button>
      </Box>
    );
  }
}
