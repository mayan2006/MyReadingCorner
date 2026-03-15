import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputAdornment
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

export default function SignUp() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.includes("@")) {
      alert("אימייל לא תקין");
      return;
    }

    if (formData.password.length < 6) {
      alert("הסיסמה חייבת לפחות 6 תווים");
      return;
    }

    console.log(formData);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5"
      }}
    >
      <Paper elevation={6} sx={{ padding: 4, width: 400 }}>

        <Typography variant="h5" align="center" mb={2}>
          התחברות לאתר
        </Typography>

        <form onSubmit={handleSubmit}>

          <TextField
            label="שם"
            name="firstName"
            fullWidth
            margin="normal"
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
            onChange={handleChange}
          />

          <TextField
            label="אימייל"
            name="email"
            fullWidth
            margin="normal"
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
            sx={{ mt: 2 }}
          >
            התחבר
          </Button>

        </form>

      </Paper>
    </Box>
  );
}


