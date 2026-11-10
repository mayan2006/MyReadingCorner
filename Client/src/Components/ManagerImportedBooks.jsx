import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  approveImportedBook,
  getPendingImportedBooks,
  rejectImportedBook
} from "../services/importBooksApi";
import { IMPORT_ASSIGN_CATEGORIES } from "../constants/bookCategories";
import { useAuth } from "../context/AuthContext.jsx";

export default function ManagerImportedBooks() {
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyCode, setBusyCode] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState({});

  const load = useCallback(async () => {
    if (!user?.userCode || user.role !== "manager") {
      setLoading(false);
      return;
    }
    setError(null);
    const data = await getPendingImportedBooks();
    if (Array.isArray(data)) {
      setRows(data);
    } else if (data?.message) {
      setError(typeof data.message === "string" ? data.message : "לא ניתן לטעון את הרשימה");
    } else {
      setError("לא ניתן לטעון את הרשימה");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.role !== "manager") {
      setLoading(false);
      return;
    }
    load();
  }, [user, load]);

  const handleApprove = async (bookCode) => {
    const categoryCode = (selectedCategories[bookCode] || "").toString().trim();
    if (!categoryCode) {
      setActionError("יש לבחור קטגוריה לפני האישור.");
      return;
    }
    setActionError(null);
    setBusyCode(bookCode);
    try {
      const res = await approveImportedBook(bookCode, categoryCode);
      if (!res || res.message !== "הספר אושר") {
        throw new Error(
          typeof res === "string" ? res : res?.message || "אישור הספר נכשל"
        );
      }
      setRows((prev) => prev.filter((book) => book.bookCode !== bookCode));
      setSelectedCategories((prev) => {
        const next = { ...prev };
        delete next[bookCode];
        return next;
      });
    } catch (e) {
      setActionError(e.message || "אישור הספר נכשל");
    } finally {
      setBusyCode(null);
    }
  };

  const handleReject = async (bookCode) => {
    setActionError(null);
    setBusyCode(bookCode);
    try {
      const res = await rejectImportedBook(bookCode);
      if (!res || res.message !== "הספר נדחה") {
        throw new Error(
          typeof res === "string" ? res : res?.message || "דחיית הספר נכשלה"
        );
      }
      setRows((prev) => prev.filter((book) => book.bookCode !== bookCode));
    } catch (e) {
      setActionError(e.message || "דחיית הספר נכשלה");
    } finally {
      setBusyCode(null);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">יש להתחבר כדי לגשת לעמוד זה.</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate("/login")}>
          כניסה
        </Button>
      </Container>
    );
  }

  if (user.role !== "manager") {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="info">עמוד זה מיועד לחשבונות מנהל בלבד.</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate("/")}>
          חזרה לדף הבית
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 0 },
        overflowX: "hidden",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top, rgba(116, 183, 255, 0.18), transparent 28%), linear-gradient(180deg, #f5fbff 0%, #e7f3ff 100%)"
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 4, px: 2, direction: "rtl", width: "100%" }}>
          <Typography
            component="h1"
            sx={{
              fontFamily: '"Frank Ruhl Libre", "David", serif',
              fontWeight: 900,
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2rem" },
              lineHeight: 1.15,
              display: "block",
              background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              mb: 0.75
            }}
          >
            ספרים מיובאים לאישור
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Heebo", sans-serif',
              fontSize: { xs: "0.78rem", sm: "0.88rem" },
              color: "#8b6914",
              display: "block",
              maxWidth: 720,
              mx: "auto",
              mt: 0.35,
              lineHeight: 1.65,
              fontWeight: 500
            }}
          >
            יצירות פרוזה מפרויקט בן־יהודה. שייכו לפנטזיה, רומנטיקה, מתח או נוער — או דחו. עד האישור הן לא מופיעות בקטלוג.
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        {actionError ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        ) : null}

        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #d7e7f7", overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table size="small" sx={{ minWidth: { xs: 720, md: "auto" } }}>
                <TableHead sx={{ bgcolor: "#f0f7ff" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>כותרת</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>מחבר</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>תקציר</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>קטגוריה</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>פעולה</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 3, textAlign: "center", color: "#5d7ea0" }}>
                          אין ספרים ממתינים כרגע. אפשר לייבא עם npm run import:benyehuda
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((book) => (
                      <TableRow key={book.bookCode || book._id}>
                        <TableCell sx={{ direction: "rtl", textAlign: "right", fontWeight: 700 }}>
                          {book.title}
                        </TableCell>
                        <TableCell sx={{ direction: "rtl", textAlign: "right" }}>
                          {book.author}
                        </TableCell>
                        <TableCell sx={{ direction: "rtl", textAlign: "right", maxWidth: 280 }}>
                          <Typography variant="body2" sx={{ color: "#5d7ea0" }}>
                            {book.summary}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 150 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              displayEmpty
                              value={selectedCategories[book.bookCode] || ""}
                              onChange={(e) =>
                                setSelectedCategories((prev) => ({
                                  ...prev,
                                  [book.bookCode]: e.target.value
                                }))
                              }
                              sx={{ fontSize: "0.85rem", direction: "rtl" }}
                            >
                              <MenuItem value="" disabled>
                                בחר קטגוריה
                              </MenuItem>
                              {IMPORT_ASSIGN_CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat} sx={{ direction: "rtl" }}>
                                  {cat}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                            <Button
                              variant="contained"
                              size="small"
                              disabled={
                                busyCode === book.bookCode ||
                                !String(selectedCategories[book.bookCode] || "").trim()
                              }
                              onClick={() => handleApprove(book.bookCode)}
                              sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                            >
                              {busyCode === book.bookCode ? "שומר..." : "אשר"}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={busyCode === book.bookCode}
                              onClick={() => handleReject(book.bookCode)}
                              sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                            >
                              דחה
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
