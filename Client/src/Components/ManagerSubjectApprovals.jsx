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
  FormControl
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPendingSubjects, approveSubjectByCode } from "../services/subjectApi";
import { BOOK_CATEGORIES } from "../constants/bookCategories";

const getStoredUser = () => {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function ManagerSubjectApprovals() {
  const navigate = useNavigate();
  const [user] = useState(() => getStoredUser());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyCode, setBusyCode] = useState(null);
  // subjectCode → selected category for that row
  const [selectedCategories, setSelectedCategories] = useState({});

  const load = useCallback(async () => {
    if (!user?.userCode || user.role !== "manager") {
      setLoading(false);
      return;
    }
    setError(null);
    const data = await getPendingSubjects(user.userCode);
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

  const handleApprove = async (subjectCode) => {
    const row = rows.find((r) => r.subjectCode === subjectCode);
    const categoryCode = (
      selectedCategories[subjectCode] ||
      row?.categoryCode ||
      ""
    )
      .toString()
      .trim();
    if (!categoryCode) {
      setActionError("יש לבחור קטגוריה לפני האישור.");
      return;
    }
    setActionError(null);
    setBusyCode(subjectCode);
    try {
      const res = await approveSubjectByCode(subjectCode, user.userCode, categoryCode);
      if (!res || res.message !== "הנושא אושר") {
        const msg =
          typeof res === "string"
            ? res
            : res?.message || "אישור הנושא נכשל";
        throw new Error(msg);
      }
      setRows((prev) => prev.filter((s) => s.subjectCode !== subjectCode));
      setSelectedCategories((prev) => {
        const next = { ...prev };
        delete next[subjectCode];
        return next;
      });
      try {
        window.dispatchEvent(new CustomEvent("library:subjects-updated"));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setActionError(e.message || "אישור הנושא נכשל");
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
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            px: 2,
            direction: "rtl",
            width: "100%"
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: '"Frank Ruhl Libre", "David", serif',
              fontWeight: 900,
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2rem" },
              lineHeight: 1.15,
              letterSpacing: "0.01em",
              display: "block",
              background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 50%, #a67c32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 1px 0 rgba(255,255,255,0.4)",
              mb: 0.75
            }}
          >
            נושאים לאישור מנהל
          </Typography>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Heebo", sans-serif',
              fontSize: { xs: "0.78rem", sm: "0.88rem" },
              color: "#8b6914",
              letterSpacing: "0.08em",
              display: "block",
              maxWidth: 720,
              mx: "auto",
              mt: 0.35,
              lineHeight: 1.65,
              fontWeight: 500
            }}
          >
            נושאים שנוצרו מכתיבה חופשית וממתינים לאישור שלך לפני שהם מופיעים ברשימת הנושאים לכולם.
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
              <Table size="small" sx={{ minWidth: { xs: 640, md: "auto" } }}>
                <TableHead sx={{ bgcolor: "#f0f7ff" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>שם הנושא</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>קוד נושא</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>הוגש ע"י</TableCell>
                    <TableCell sx={{ fontWeight: 700, direction: "rtl" }}>קטגוריה</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>פעולה</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography sx={{ py: 3, textAlign: "center", color: "#5d7ea0" }}>
                          אין נושאים ממתינים כרגע
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((s) => (
                      <TableRow key={s.subjectCode || s._id}>
                        <TableCell sx={{ direction: "rtl", textAlign: "right" }}>{s.name}</TableCell>
                        <TableCell>{s.subjectCode}</TableCell>
                        <TableCell>{s.requestedByUserCode || "—"}</TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              displayEmpty
                              value={(selectedCategories[s.subjectCode] ?? s.categoryCode ?? "") || ""}
                              onChange={(e) =>
                                setSelectedCategories((prev) => ({
                                  ...prev,
                                  [s.subjectCode]: e.target.value
                                }))
                              }
                              sx={{ fontSize: "0.85rem", direction: "rtl" }}
                            >
                              <MenuItem value="" disabled>
                                בחר קטגוריה
                              </MenuItem>
                              {BOOK_CATEGORIES.map((cat) => (
                                <MenuItem key={cat} value={cat} sx={{ direction: "rtl" }}>
                                  {cat}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={
                              busyCode === s.subjectCode ||
                              !(
                                (selectedCategories[s.subjectCode] ?? s.categoryCode ?? "")
                                  .toString()
                                  .trim()
                              )
                            }
                            onClick={() => handleApprove(s.subjectCode)}
                            sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                          >
                            {busyCode === s.subjectCode ? "שומר..." : "אשר נושא"}
                          </Button>
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
