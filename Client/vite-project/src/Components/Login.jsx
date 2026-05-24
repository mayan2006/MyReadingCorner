import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  Link
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { loginUser } from "../services/UserAPI";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      setIsSubmitting(true);
      const response = await loginUser(formData);
      if (!response?.user) {
        setErrorMessage("התחברות נכשלה");
        return;
      }
      onLogin(response.user);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "התחברות נכשלה");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        direction: "rtl",
        background:
          "radial-gradient(circle at top, rgba(116, 183, 255, 0.2), transparent 28%), linear-gradient(180deg, #f5fbff 0%, #e7f3ff 100%)"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 4,
          width: 430,
          maxWidth: "100%",
          borderRadius: 4,
          border: "1px solid #d7e7f7",
          boxShadow: "0 18px 36px rgba(45, 116, 186, 0.1)",
          background: "linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%)"
        }}
      >
        <Typography variant="h4" mb={1} align="center" sx={{ color: "#1f5d99", fontWeight: 700 }}>
          כניסה לאתר
        </Typography>
        <Typography sx={{ color: "#5d7ea0", mb: 2 }} align="center">
          משתמשים רגילים ומנהלים — אותה טופס כניסה (לפי האימייל שבמערכת)
        </Typography>
        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>
          <TextField
            label="אימייל"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            required
            value={formData.email}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="סיסמה"
            type="password"
            name="password"
            fullWidth
            margin="normal"
            required
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 700,
              background: "linear-gradient(135deg, #2f7dd1 0%, #5aa4ea 100%)",
              boxShadow: "0 10px 22px rgba(47, 125, 209, 0.28)",
              "&:hover": {
                background: "linear-gradient(135deg, #246cb7 0%, #4a94dc 100%)"
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "מתחבר..." : "כניסה"}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link component={RouterLink} to="/signup" underline="hover">
            אין לך חשבון? הרשמה
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
