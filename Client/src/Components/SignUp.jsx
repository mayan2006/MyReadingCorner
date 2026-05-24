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
import { addUser } from "../services/UserAPI";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export default function SignUp({ onLogin }) {
  const navigate = useNavigate();
  const passwordRuleText = "הסיסמה חייבת להכיל לפחות 8 תווים, אות קטנה, אות גדולה ומספר.";
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedEmail = formData.email.trim().toLowerCase();

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage("יש למלא שם פרטי ושם משפחה.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      setErrorMessage("אימייל לא תקין");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setErrorMessage(passwordRuleText);
      return;
    }

    try {
      setIsSubmitting(true);

      // userCode is generated in code so the user never types it manually.
      const userPayload = {
        ...formData,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        userCode: `USR-${Date.now()}`,
        userStatus: true,
        img: ""
      };

      const response = await addUser(userPayload);

      if (!response || !response.user) {
        setErrorMessage("שמירת המשתמש נכשלה. נסה שוב.");
        return;
      }

      onLogin(response.user);
      setSuccessMessage("נרשמת בהצלחה!");
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "אירעה שגיאה בהרשמה. נסה שוב.");
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
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        boxSizing: "border-box",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at top, rgba(116, 183, 255, 0.2), transparent 28%), linear-gradient(180deg, #f5fbff 0%, #e7f3ff 100%)"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          width: { xs: "100%", sm: 430 },
          maxWidth: "100%",
          borderRadius: 4,
          border: "1px solid #d7e7f7",
          boxShadow: "0 18px 36px rgba(45, 116, 186, 0.1)",
          background: "linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%)"
        }}
      >

        <Typography
          variant="h4"
          mb={1}
          align="center"
          sx={{ color: "#1f5d99", fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          הרשמה לאתר
        </Typography>
        <Typography sx={{ color: "#5d7ea0", mb: 2 }} align="center">
          הצטרפו לספריה האישית שלכם
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          {passwordRuleText}
        </Alert>
        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        ) : null}
        {successMessage ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit}>

          <TextField
            label="שם"
            name="firstName"
            fullWidth
            margin="normal"
            required
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon/>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="שם משפחה"
            name="lastName"
            fullWidth
            margin="normal"
            required
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon/>
                </InputAdornment>
              )
            }} 
          />

          <TextField
            label="אימייל"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            required
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon/>
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
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon/>
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
            {isSubmitting ? "שומר..." : "הרשמה"}
          </Button>

        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link component={RouterLink} to="/login" underline="hover">
            כבר רשומים? כניסה
          </Link>
        </Box>

      </Paper>
    </Box>
  );
}


