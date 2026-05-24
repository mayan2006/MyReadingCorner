import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  CircularProgress,
  Avatar,
  Stack,
  Chip
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  addFreeWriting,
  getAllFreeWriting,
  getFreeWritingByWritingCode,
  updateFreeWritingByWritingCode,
  uploadFreeWritingCover
} from "../services/freeWritingApi";
import { resolveMediaUrl } from "../services/apiBase";
import {
  getAllSubjects,
  createUserSubjectRequest,
  getSubjectBySubjectCode
} from "../services/subjectApi";
import { BOOK_CATEGORIES, DEFAULT_SUBJECT_CATEGORY } from "../constants/bookCategories";

const createWritingCode = () => `FW-${Date.now()}`;
const getLoggedInUser = () => {
  const rawCurrentUser = localStorage.getItem("currentUser");
  if (rawCurrentUser) {
    try {
      const parsed = JSON.parse(rawCurrentUser);
      if (parsed?.userCode) return parsed;
    } catch {}
  }
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      if (parsed?.userCode) return parsed;
    } catch {}
  }
  const userCode = localStorage.getItem("userCode") || "";
  return userCode ? { userCode, firstName: "", lastName: "" } : null;
};

const fwInput = '"Heebo", sans-serif';
const fwAccent = '"Frank Ruhl Libre", "David", serif';

// shared input styling + RTL — תואם Navbar / שאר האתר (כחול #1f5d99, זהב #a67c32, Heebo)
const fieldSx = {
  direction: "rtl",
  textAlign: "right",
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    fontFamily: fwInput,
    background: "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,251,255,0.94) 100%)",
    transition: "box-shadow .22s ease, border-color .22s ease, background .22s ease",
    boxShadow: "inset 0 1px 2px rgba(45,116,186,0.05)",
    "& fieldset": {
      borderColor: "rgba(201,166,106,0.42)",
      borderWidth: 1
    },
    "&:hover fieldset": { borderColor: "#c9a66a" },
    "&.Mui-focused": {
      boxShadow: "0 0 0 4px rgba(31,93,153,0.11), inset 0 1px 2px rgba(45,116,186,0.04)"
    },
    "&.Mui-focused fieldset": { borderColor: "#1f5d99", borderWidth: 1.5 },
    "&.Mui-disabled": {
      backgroundColor: "rgba(245,249,252,0.85)",
      "& fieldset": { borderColor: "rgba(219,231,244,0.9)" }
    }
  },
  "& .MuiOutlinedInput-input": {
    textAlign: "right",
    direction: "rtl",
    fontFamily: fwInput,
    fontWeight: 500,
    fontSize: "0.9375rem",
    letterSpacing: "0.02em",
    lineHeight: 1.55,
    color: "#1a2d4a",
    "&::placeholder": {
      color: "#5d7ea0",
      opacity: 1,
      fontWeight: 400,
      fontStyle: "normal",
      letterSpacing: "0.025em"
    }
  },
  "& .MuiInputBase-inputMultiline": {
    textAlign: "right",
    direction: "rtl",
    fontFamily: fwInput,
    fontWeight: 500,
    fontSize: "0.9375rem",
    letterSpacing: "0.02em",
    lineHeight: 1.65,
    color: "#1a2d4a",
    "&::placeholder": {
      color: "#5d7ea0",
      opacity: 1,
      fontWeight: 400,
      letterSpacing: "0.025em"
    }
  },
  "& .MuiFormHelperText-root": {
    textAlign: "right",
    marginRight: 0,
    marginLeft: 0,
    fontFamily: fwInput,
    fontSize: "0.8125rem",
    fontWeight: 400,
    color: "#5d7ea0",
    lineHeight: 1.55,
    letterSpacing: "0.015em"
  },
  "& .MuiInputLabel-root": {
    transformOrigin: "top right",
    right: 28,
    left: "auto",
    fontFamily: fwInput,
    fontWeight: 600,
    fontSize: "0.9rem",
    letterSpacing: "0.02em",
    color: "#5d7ea0",
    "&.Mui-focused": { color: "#1f5d99" },
    "&.MuiInputLabel-shrink": {
      fontWeight: 700,
      color: "#1f5d99",
      letterSpacing: "0.03em"
    }
  },
  "& .MuiSelect-select": {
    textAlign: "right",
    direction: "rtl",
    fontFamily: fwInput,
    fontWeight: 500,
    fontSize: "0.9375rem",
    letterSpacing: "0.02em",
    color: "#1a2d4a",
    display: "flex",
    alignItems: "center",
    minHeight: "1.45em"
  },
  "& .MuiSelect-icon": {
    color: "#a67c32",
    right: "auto",
    left: 8
  }
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      direction: "rtl",
      textAlign: "right",
      borderRadius: 2.5,
      mt: 0.5,
      border: "1px solid rgba(219, 234, 249, 0.95)",
      boxShadow: "0 14px 36px rgba(31, 93, 153, 0.12)",
      overflow: "hidden",
      "& .MuiMenuItem-root": {
        fontFamily: fwInput,
        fontSize: "0.9375rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        color: "#1a2d4a",
        py: 1.1,
        "&:hover": { backgroundColor: "rgba(245, 251, 255, 0.98) !important" },
        "&.Mui-selected": {
          backgroundColor: "rgba(31, 93, 153, 0.08) !important",
          fontWeight: 600,
          color: "#1f5d99",
          "&:hover": { backgroundColor: "rgba(31, 93, 153, 0.12) !important" }
        }
      },
      "& .MuiListSubheader-root": {
        fontFamily: fwAccent,
        fontWeight: 700,
        color: "#1f5d99",
        bgcolor: "rgba(245,251,255,0.95)"
      }
    }
  },
  anchorOrigin: { vertical: "bottom", horizontal: "right" },
  transformOrigin: { vertical: "top", horizontal: "right" }
};

/** כותרות «סוג פרק» / «נושא» — תואם כותרות באתר */
const choiceLegendSx = {
  fontFamily: fwInput,
  fontWeight: 800,
  fontSize: { xs: "0.98rem", sm: "1.06rem" },
  letterSpacing: "0.04em",
  color: "#1f5d99",
  mb: 1.25,
  width: "100%",
  textAlign: "right",
  lineHeight: 1.35,
  "&.Mui-focused": { color: "#1f5d99" }
};

/** טקסט בתוך כרטיסי הבחירה (רדיו) — אותה שפה ויזואלית כמו בשדות הקלט */
const choiceOptionLabelSx = {
  direction: "rtl",
  alignItems: "flex-start",
  mx: 0,
  gap: 1.1,
  "& .MuiFormControlLabel-label": {
    fontFamily: fwInput,
    fontWeight: 500,
    fontSize: { xs: "0.875rem", sm: "0.93rem" },
    letterSpacing: "0.025em",
    lineHeight: 1.58,
    color: "#1a2d4a",
    textAlign: "right",
    whiteSpace: "normal",
    userSelect: "none"
  }
};

const choiceRadioSx = {
  p: 0.65,
  alignSelf: "flex-start",
  mt: 0.2,
  color: "rgba(166,124,50,0.55)",
  "&.Mui-checked": { color: "#1f5d99" },
  "&:hover": { bgcolor: "rgba(31,93,153,0.07)" }
};

export default function FreeWritingForm() {
  const { writingCode: editWritingCode } = useParams();
  const isEditMode = Boolean(editWritingCode);
  const navigate = useNavigate();

  const loggedInUser = getLoggedInUser();
  const initialUserCode = loggedInUser?.userCode || "";
  const authorName =
    `${loggedInUser?.firstName || ""} ${loggedInUser?.lastName || ""}`.trim() ||
    initialUserCode;

  const [subjectSource, setSubjectSource] = useState("list");
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [customSubjectCategory, setCustomSubjectCategory] = useState(DEFAULT_SUBJECT_CATEGORY);
  const [form, setForm] = useState({
    subjectCode: "",
    chapter: "",
    name: "",
    summary: "",
    content: ""
  });

  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [editMeta, setEditMeta] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [bookScope, setBookScope] = useState("standalone");
  const [sequelSeriesCode, setSequelSeriesCode] = useState("");
  const [myWritings, setMyWritings] = useState([]);
  const coverInputRef = useRef(null);
  const [coverFile, setCoverFile] = useState(null);
  const [blobPreviewUrl, setBlobPreviewUrl] = useState(null);
  const [existingCoverPath, setExistingCoverPath] = useState("");
  const [submitBusy, setSubmitBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (blobPreviewUrl) URL.revokeObjectURL(blobPreviewUrl);
    };
  }, [blobPreviewUrl]);

  const seriesOptions = useMemo(() => {
    const bySeries = new Map();
    for (const w of myWritings) {
      const sk = w.seriesCode || w.writingCode;
      if (!bySeries.has(sk)) bySeries.set(sk, []);
      bySeries.get(sk).push(w);
    }
    return Array.from(bySeries.entries()).map(([seriesKey, arr]) => {
      const sorted = [...arr].sort((a, b) => (a.chapter || 0) - (b.chapter || 0));
      const first = sorted[0];
      return {
        seriesKey,
        label: `${first?.name || "ללא כותרת"} · ${sorted.length} פרקים`,
        count: sorted.length
      };
    });
  }, [myWritings]);

  useEffect(() => {
    if (isEditMode || !initialUserCode) return;
    (async () => {
      const all = await getAllFreeWriting();
      if (!Array.isArray(all)) return;
      setMyWritings(all.filter((w) => w.userCode === initialUserCode));
    })();
  }, [isEditMode, initialUserCode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getAllSubjects();
      if (cancelled) return;
      if (!Array.isArray(data)) {
        setError("לא הצלחנו לטעון את רשימת הנושאים");
        return;
      }
      const filtered = data.filter((s) => {
        if (s.managerApproved === false) {
          return Boolean(initialUserCode) && (s.requestedByUserCode || "") === initialUserCode;
        }
        if (s.managerApproved === true) return s.isApproved !== false;
        return s.isApproved !== false;
      });
      setSubjects(filtered);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialUserCode]);

  useEffect(() => {
    if (!isEditMode || !editWritingCode || subjects.length === 0) return;
    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      setError(null);
      const doc = await getFreeWritingByWritingCode(editWritingCode);
      if (cancelled) return;

      if (!doc || doc.message || !doc.writingCode) {
        setError(typeof doc?.message === "string" ? doc.message : "לא ניתן לטעון את הכתיבה");
        setLoadingEdit(false);
        return;
      }
      if (doc.userCode !== initialUserCode) {
        setError("אין הרשאה לערוך כתיבה זו");
        setLoadingEdit(false);
        return;
      }

      let subjectLabel = doc.subjectCode;
      const inList = subjects.find((s) => s.subjectCode === doc.subjectCode);
      if (inList) {
        subjectLabel = `${inList.name} (${doc.subjectCode})`;
      } else {
        const sub = await getSubjectBySubjectCode(doc.subjectCode);
        if (sub && !sub.message && sub.name) {
          subjectLabel = `${sub.name} (${doc.subjectCode})`;
        }
      }

      setBlobPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCoverFile(null);
      setExistingCoverPath(doc.img || "");

      setEditMeta({
        subjectCode: doc.subjectCode,
        subjectLabel,
        isApproved: Boolean(doc.isApproved)
      });
      setForm({
        subjectCode: doc.subjectCode,
        chapter: String(doc.chapter ?? ""),
        name: doc.name || "",
        summary: doc.summary || "",
        content: doc.content || ""
      });
      setLoadingEdit(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editWritingCode, subjects, initialUserCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ subjectCode: "", chapter: "", name: "", summary: "", content: "" });
    setCustomSubjectName("");
    setSubjectSource("list");
    setBookScope("standalone");
    setSequelSeriesCode("");
    setBlobPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setCoverFile(null);
    setExistingCoverPath("");
  };

  const handleCoverPick = () => coverInputRef.current?.click();

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("נא לבחור קובץ תמונה.");
      return;
    }
    setError(null);
    setBlobPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setCoverFile(f);
    e.target.value = "";
  };

  const uploadCoverIfNeeded = async (writingCode) => {
    if (!coverFile || !writingCode) return;
    const up = await uploadFreeWritingCover(writingCode, initialUserCode, coverFile);
    if (!up || up.message !== "cover updated") {
      const msg = typeof up === "string" ? up : up?.message || "העלאת תמונת הכריכה נכשלה";
      throw new Error(msg);
    }
  };

  const displayCoverSrc = blobPreviewUrl || resolveMediaUrl(existingCoverPath);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!initialUserCode) {
      setError("לא נמצא משתמש מחובר. התחבר/י כדי לשמור כתיבה.");
      return;
    }

    if (isEditMode) {
      if (!editMeta) {
        setError("טוען נתונים… נסו שוב בעוד רגע.");
        return;
      }
      setSubmitBusy(true);
      const dataToSend = {
        ...form,
        subjectCode: editMeta.subjectCode,
        writingCode: editWritingCode,
        userCode: initialUserCode,
        author: authorName,
        chapter: Number(form.chapter),
        date: new Date(),
        isApproved: editMeta.isApproved
      };
      try {
        const response = await updateFreeWritingByWritingCode(editWritingCode, dataToSend);
        if (!response || response.message !== "freeWriting updated") {
          throw new Error(typeof response === "string" ? response : "אירעה שגיאה בשמירה");
        }
        await uploadCoverIfNeeded(editWritingCode);
        const Swal = globalThis.Swal;
        if (Swal?.fire) {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Your work has been saved",
            showConfirmButton: false,
            timer: 1500
          });
        }
        navigate("/my-books");
      } catch (err) {
        setError(err.message || "אירעה שגיאה בשמירה");
      } finally {
        setSubmitBusy(false);
      }
      return;
    }

    let subjectCode = form.subjectCode;

    if (bookScope === "sequel") {
      if (!sequelSeriesCode) {
        setError("נא לבחור ספר קיים להמשך.");
        return;
      }
      if (!myWritings.length) {
        setError("אין כתיבות קודמות — התחילו בפרק ראשון.");
        return;
      }
      subjectCode = undefined;
    } else if (subjectSource === "list") {
      if (!subjectCode) {
        setError("נא לבחור נושא מהרשימה.");
        return;
      }
    } else {
      const trimmed = customSubjectName.trim();
      if (!trimmed) {
        setError("נא להזין שם לנושא החדש.");
        return;
      }
      const subRes = await createUserSubjectRequest({
        name: trimmed,
        userCode: initialUserCode,
        categoryCode: customSubjectCategory
      });
      if (!subRes?.Subject?.subjectCode) {
        const msg =
          typeof subRes === "string" ? subRes : subRes?.message || "שמירת הנושא החדש נכשלה";
        setError(msg);
        return;
      }
      subjectCode = subRes.Subject.subjectCode;
      try {
        window.dispatchEvent(new CustomEvent("library:subjects-updated"));
      } catch {
        /* ignore */
      }
    }

    const newCode = createWritingCode();
    const dataToSend = {
      writingCode: newCode,
      seriesCode: bookScope === "sequel" && sequelSeriesCode ? sequelSeriesCode : newCode,
      subjectCode: bookScope === "sequel" ? undefined : subjectCode,
      userCode: initialUserCode,
      author: authorName,
      chapter: bookScope === "sequel" ? 1 : Number(form.chapter),
      name: form.name,
      summary: form.summary,
      content: form.content,
      date: new Date(),
      isApproved: false
    };

    setSubmitBusy(true);
    try {
      const response = await addFreeWriting(dataToSend);
      if (!response || response.message !== "freeWriting added to DB") {
        throw new Error(typeof response === "string" ? response : "אירעה שגיאה בשליחה");
      }
      const wc = response?.freeWriting?.writingCode;
      if (!wc) throw new Error("לא התקבל מזהה כתיבה מהשרת");
      await uploadCoverIfNeeded(wc);
      const Swal = globalThis.Swal;
      if (Swal?.fire) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 1500
        });
      }
      resetForm();
    } catch (err) {
      setError(err.message || "אירעה שגיאה בשליחה");
    } finally {
      setSubmitBusy(false);
    }
  };

  return (
    <Box
      dir="rtl"
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(1100px 500px at 80% -10%, rgba(116,183,255,0.28), transparent 60%), radial-gradient(800px 400px at 0% 10%, rgba(180,210,255,0.25), transparent 60%), linear-gradient(180deg, #f5fbff 0%, #e7f3ff 100%)",
        py: { xs: 3, md: 7 },
        px: { xs: 1.5, md: 0 }
      }}
    >
      <Container maxWidth="sm">
        {/* Header card */}
        <Stack alignItems="center" spacing={1.2} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #2f7dd1 0%, #5aa4ea 100%)",
              color: "#fff",
              boxShadow: "0 14px 28px rgba(47,125,209,0.35)"
            }}
          >
            {isEditMode ? <EditNoteRoundedIcon /> : <AutoStoriesRoundedIcon />}
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800, color: "#1f5d99", textAlign: "center", letterSpacing: "-0.02em" }}
          >
            {isEditMode ? "עריכת כתיבה" : "הוספת כתיבה חופשית"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#5d7ea0", textAlign: "center", maxWidth: 460 }}>
            {isEditMode
              ? "עדכנו את הפרטים ושמרו — הנושא נשאר כפי שנבחר בעת היצירה."
              : "מלאו את הפרטים ושלחו את הכתיבה שלכם למערכת. ניתן להוסיף פרקים נוספים לאותו ספר."}
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          dir="rtl"
          sx={{
            borderRadius: 5,
            border: "1px solid #d7e7f7",
            boxShadow:
              "0 30px 60px -25px rgba(45,116,186,0.25), 0 8px 20px -10px rgba(45,116,186,0.15)",
            p: { xs: 2.5, md: 4 },
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(243,249,255,0.95) 100%)",
            backdropFilter: "blur(6px)",
            direction: "rtl",
            textAlign: "right"
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
                border: "1px solid #f3c8c8",
                "& .MuiAlert-icon": { alignItems: "center" }
              }}
            >
              {error}
            </Alert>
          )}

          {isEditMode && loadingEdit ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ direction: "rtl", textAlign: "right" }}>
              {isEditMode && editMeta ? (
                <Box
                  sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#f4faff",
                    border: "1px solid #dbeaf9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    flexWrap: "wrap"
                  }}
                >
                  <Box sx={{ textAlign: "right", flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: "#5d7ea0", fontWeight: 700, letterSpacing: ".02em", display: "block", textAlign: "right" }}>
                      נושא (לא ניתן לשינוי כאן)
                    </Typography>
                    <Typography sx={{ color: "#1f5d99", fontWeight: 700, textAlign: "right" }}>
                      {editMeta.subjectLabel}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={editMeta.isApproved ? "מאושר" : "ממתין לאישור"}
                    sx={{
                      bgcolor: editMeta.isApproved ? "#e2f4e8" : "#fff3d6",
                      color: editMeta.isApproved ? "#1f7a45" : "#8a5a08",
                      fontWeight: 700
                    }}
                  />
                </Box>
              ) : null}

              {!isEditMode ? (
                <>
                  <FormControl component="fieldset" fullWidth sx={{ mb: 1, alignItems: "stretch" }}>
                    <FormLabel component="legend" sx={choiceLegendSx}>
                      סוג פרק
                    </FormLabel>
                    <RadioGroup
                      value={bookScope}
                      onChange={(e) => {
                        setBookScope(e.target.value);
                        if (e.target.value === "standalone") setSequelSeriesCode("");
                      }}
                      sx={{ gap: 1.15, width: "100%" }}
                    >
                      {[
                        { v: "standalone", label: "ספר / פרק חדש (בוחרים נושא ומספר פרק)" },
                        {
                          v: "sequel",
                          label: "פרק נוסף לספר שכבר התחלתי (מספר פרק אוטומטי, נושא כמו בפרק הראשון)"
                        }
                      ].map((opt) => {
                        const selected = bookScope === opt.v;
                        return (
                          <FormControlLabel
                            key={opt.v}
                            value={opt.v}
                            control={<Radio sx={choiceRadioSx} />}
                            label={opt.label}
                            sx={{
                              ...choiceOptionLabelSx,
                              m: 0,
                              p: 1.25,
                              borderRadius: 2.5,
                              border: "1px solid",
                              borderColor: selected ? "#1f5d99" : "rgba(201,166,106,0.42)",
                              background: selected
                                ? "linear-gradient(180deg, rgba(230,242,255,0.72) 0%, rgba(245,251,255,0.96) 100%)"
                                : "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,251,255,0.9) 100%)",
                              boxShadow: selected ? "inset 0 1px 0 rgba(255,255,255,0.65)" : "inset 0 1px 2px rgba(45,116,186,0.04)",
                              transition: "border-color .2s ease, background .2s ease, box-shadow .2s ease",
                              "&:hover": { borderColor: selected ? "#1f5d99" : "#c9a66a" }
                            }}
                          />
                        );
                      })}
                    </RadioGroup>
                  </FormControl>

                  {bookScope === "sequel" ? (
                    <>
                      {!seriesOptions.length ? (
                        <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
                          אין עדיין כתיבות — צרו תחילה פרק ראשון ב&quot;ספר / פרק חדש&quot;.
                        </Alert>
                      ) : null}
                      <FormControl fullWidth margin="normal" required disabled={!seriesOptions.length} sx={fieldSx}>
                        <InputLabel id="sequel-series-label" sx={{ transformOrigin: "top right", right: 28, left: "auto" }}>
                          בחרו ספר להמשיך
                        </InputLabel>
                        <Select
                          labelId="sequel-series-label"
                          label="בחרו ספר להמשיך"
                          value={sequelSeriesCode}
                          onChange={(e) => setSequelSeriesCode(e.target.value)}
                          MenuProps={selectMenuProps}
                        >
                          {seriesOptions.map((opt) => (
                            <MenuItem key={opt.seriesKey} value={opt.seriesKey}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  ) : null}

                  {bookScope === "standalone" ? (
                    <>
                      <FormControl component="fieldset" fullWidth margin="normal" sx={{ mb: 1, alignItems: "stretch" }}>
                        <FormLabel component="legend" sx={choiceLegendSx}>
                          נושא
                        </FormLabel>
                        <RadioGroup
                          row
                          value={subjectSource}
                          onChange={(e) => setSubjectSource(e.target.value)}
                          sx={{ flexWrap: "wrap", gap: 1.1, width: "100%" }}
                        >
                          {[
                            { v: "list", label: "מהרשימה" },
                            { v: "custom", label: "נושא חדש שלי (ממתין לאישור מנהל)" }
                          ].map((opt) => {
                            const selected = subjectSource === opt.v;
                            return (
                              <FormControlLabel
                                key={opt.v}
                                value={opt.v}
                                control={<Radio sx={choiceRadioSx} />}
                                label={opt.label}
                                sx={{
                                  ...choiceOptionLabelSx,
                                  m: 0,
                                  px: 1.65,
                                  py: 0.9,
                                  borderRadius: 999,
                                  border: "1px solid",
                                  borderColor: selected ? "#1f5d99" : "rgba(201,166,106,0.42)",
                                  background: selected
                                    ? "linear-gradient(135deg, rgba(31,93,153,0.1) 0%, rgba(255,253,248,0.82) 100%)"
                                    : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,251,255,0.92) 100%)",
                                  boxShadow: "inset 0 1px 2px rgba(45,116,186,0.04)",
                                  transition: "border-color .2s ease, background .2s ease",
                                  "&:hover": { borderColor: selected ? "#1f5d99" : "#c9a66a" }
                                }}
                              />
                            );
                          })}
                        </RadioGroup>
                      </FormControl>

                      {subjectSource === "list" ? (
                        <FormControl fullWidth margin="normal" required sx={fieldSx}>
                          <InputLabel id="subject-select-label" sx={{ transformOrigin: "top right", right: 28, left: "auto" }}>
                            בחירת נושא
                          </InputLabel>
                          <Select
                            labelId="subject-select-label"
                            label="בחירת נושא"
                            name="subjectCode"
                            value={form.subjectCode}
                            onChange={handleChange}
                            MenuProps={selectMenuProps}
                          >
                            {subjects.map((subject) => (
                              <MenuItem key={subject.subjectCode} value={subject.subjectCode}>
                                {subject.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <>
                          <FormControl fullWidth margin="normal" required sx={fieldSx}>
                            <InputLabel id="custom-subject-category-label" sx={{ transformOrigin: "top right", right: 28, left: "auto" }}>
                              קטגוריה לתצוגה בדף הבית
                            </InputLabel>
                            <Select
                              labelId="custom-subject-category-label"
                              label="קטגוריה לתצוגה בדף הבית"
                              value={customSubjectCategory}
                              onChange={(e) => setCustomSubjectCategory(e.target.value)}
                              MenuProps={selectMenuProps}
                            >
                              {BOOK_CATEGORIES.map((c) => (
                                <MenuItem key={c} value={c} sx={{ direction: "rtl" }}>
                                  {c}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <TextField
                            label="שם הנושא החדש"
                            value={customSubjectName}
                            onChange={(e) => setCustomSubjectName(e.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            helperText="הנושא יישמר במערכת ויוצג תחת הקטגוריה שבחרת (עם סימון ממתין עד אישור מנהל). אין צורך לערוך ידנית במסד נתונים."
                            inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
                            sx={fieldSx}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <Box sx={{ mb: 2, p: 1.75, borderRadius: 2.5, bgcolor: "#f4faff", border: "1px solid #dbeaf9" }}>
                      <Typography variant="body2" sx={{ color: "#5d7ea0", textAlign: "right" }}>
                        הנושא יישאר זהה לספר שנבחר (כמו בפרק הראשון של הסדרה).
                      </Typography>
                    </Box>
                  )}

                  {bookScope === "standalone" ? (
                    <TextField
                      label="פרק"
                      name="chapter"
                      type="number"
                      value={form.chapter}
                      onChange={handleChange}
                      required
                      fullWidth
                      margin="normal"
                      inputProps={{ min: 1, dir: "rtl", style: { textAlign: "right" } }}
                      sx={fieldSx}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: "#5d7ea0", mb: 2, mt: 1, textAlign: "right" }}>
                      מספר הפרק ייקבע אוטומטית (הבא ברצף).
                    </Typography>
                  )}
                </>
              ) : (
                <TextField
                  label="פרק"
                  name="chapter"
                  type="number"
                  value={form.chapter}
                  onChange={handleChange}
                  required
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 1, dir: "rtl", style: { textAlign: "right" } }}
                  sx={fieldSx}
                />
              )}

              <TextField
                label="שם הכתיבה"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
                sx={fieldSx}
              />
              <TextField
                label="תקציר"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                multiline
                minRows={2}
                inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
                sx={fieldSx}
              />
              <TextField
                label="תוכן הסיפור"
                name="content"
                multiline
                rows={9}
                value={form.content}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
                sx={fieldSx}
              />

              {/* ריווח מהכתיבה — כריכה ושליחה למטה */}
              <Box sx={{ mt: { xs: 5, md: 6 }, mb: 1 }}>
                <Box
                  sx={{
                    mb: { xs: 3.5, md: 4 },
                    height: 4,
                    borderRadius: 99,
                    maxWidth: 420,
                    mx: "auto",
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(47,125,209,0.28) 25%, rgba(166,124,50,0.35) 50%, rgba(47,125,209,0.28) 75%, transparent 100%)",
                    opacity: 0.85,
                    boxShadow: "0 2px 12px rgba(47,125,209,0.12)"
                  }}
                />

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 3.5,
                    border: "1px solid rgba(201, 166, 106, 0.35)",
                    background:
                      "linear-gradient(145deg, rgba(255,253,248,0.98) 0%, rgba(250,243,229,0.55) 45%, rgba(243,249,255,0.65) 100%)",
                    boxShadow: "0 18px 40px rgba(62, 48, 28, 0.06)",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      insetInlineEnd: 0,
                      top: 0,
                      width: "42%",
                      height: "100%",
                      background:
                        "radial-gradient(ellipse at top right, rgba(166,124,50,0.09), transparent 55%)",
                      pointerEvents: "none"
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Chip
                      size="small"
                      icon={<AutoStoriesRoundedIcon sx={{ fontSize: "18px !important" }} />}
                      label="כריכה"
                      sx={{
                        fontWeight: 700,
                        color: "#5c4a38",
                        bgcolor: "rgba(166,124,50,0.11)",
                        border: "1px solid rgba(166,124,50,0.28)",
                        "& .MuiChip-icon": { color: "#8b6914" }
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1a2d4a", letterSpacing: ".02em" }}>
                      תמונת כריכה · אופציונלי
                    </Typography>
                  </Stack>

                  <Typography variant="body2" sx={{ color: "#6b7f93", mb: 2.5, maxWidth: 520, lineHeight: 1.65 }}>
                    מוצגת בכרטיס הספר בספריה — בעיצוב נקי ועקבי עם שאר האתר. JPG או PNG.
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={{ xs: 2.5, sm: 3 }}
                    sx={{ position: "relative", zIndex: 1 }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        flexShrink: 0,
                        alignSelf: { xs: "center", sm: "flex-start" }
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: -4,
                          borderRadius: 3,
                          background:
                            "linear-gradient(135deg, rgba(166,124,50,0.35), rgba(47,125,209,0.2))",
                          opacity: displayCoverSrc ? 1 : 0.55,
                          filter: "blur(0.5px)"
                        }}
                      />
                      <Avatar
                        variant="rounded"
                        src={displayCoverSrc || undefined}
                        sx={{
                          width: { xs: 118, sm: 132 },
                          height: { xs: 148, sm: 168 },
                          borderRadius: 2.75,
                          bgcolor: "#fffefb",
                          border: "3px solid #fff",
                          color: "#b89552",
                          boxShadow:
                            "0 14px 32px rgba(62,48,28,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
                          position: "relative"
                        }}
                      >
                        {!displayCoverSrc ? (
                          <PhotoCameraRoundedIcon sx={{ fontSize: 46, opacity: 0.85 }} />
                        ) : null}
                      </Avatar>
                    </Box>

                    <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0, pt: { sm: 0.5 } }}>
                      <Button
                        type="button"
                        onClick={handleCoverPick}
                        variant="contained"
                        disableElevation
                        startIcon={<PhotoCameraRoundedIcon />}
                        sx={{
                          alignSelf: { xs: "stretch", sm: "flex-start" },
                          py: 1.15,
                          px: 2.75,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          background: "linear-gradient(135deg, #1f5d99 0%, #2f7dd1 55%, #3d8bd9 100%)",
                          boxShadow: "0 10px 24px rgba(31, 93, 153, 0.28)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          transition: "transform .18s ease, box-shadow .22s ease",
                          "&:hover": {
                            background: "linear-gradient(135deg, #17487a 0%, #246cb7 55%, #2f7dd1 100%)",
                            boxShadow: "0 14px 28px rgba(31, 93, 153, 0.35)",
                            transform: "translateY(-2px)"
                          }
                        }}
                      >
                        {displayCoverSrc ? "החלפת תמונת כריכה" : "בחירת תמונה מהמחשב"}
                      </Button>

                      <Typography variant="caption" sx={{ color: "#889cb5", display: "block", pl: 0.25 }}>
                        גרירה אינה נתמכת כאן — לחצו על הכפתור ובחרו קובץ.
                      </Typography>
                    </Stack>
                  </Stack>

                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleCoverChange}
                  />
                </Paper>
              </Box>

              <Box
                sx={{
                  mt: { xs: 4, md: 5 },
                  pt: { xs: 3.5, md: 4 },
                  px: { xs: 0.5, sm: 1 },
                  borderTop: "1px solid rgba(47, 125, 209, 0.12)",
                  background:
                    "linear-gradient(180deg, rgba(247,251,255,0.65) 0%, transparent 45%)",
                  borderRadius: "0 0 12px 12px"
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={submitBusy || (isEditMode && (loadingEdit || !editMeta))}
                  startIcon={
                    submitBusy ? (
                      <CircularProgress size={18} sx={{ color: "#fff" }} />
                    ) : isEditMode ? (
                      <SaveRoundedIcon />
                    ) : (
                      <SendRoundedIcon />
                    )
                  }
                  sx={{
                    py: 1.55,
                    borderRadius: 2.75,
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    letterSpacing: ".015em",
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #1f5d99 0%, #2f7dd1 42%, #4a93dc 100%)",
                    boxShadow:
                      "0 14px 32px rgba(31, 93, 153, 0.33), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    transition: "transform .16s ease, box-shadow .2s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #17487a 0%, #246cb7 45%, #2f7dd1 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 20px 40px rgba(31, 93, 153, 0.38)"
                    },
                    "&.Mui-disabled": {
                      background: "linear-gradient(135deg, #aecbe7 0%, #c5daf1 100%)",
                      color: "#fff",
                      opacity: 0.92,
                      borderColor: "transparent"
                    }
                  }}
                >
                  {submitBusy ? "שומר…" : isEditMode ? "שמור שינויים" : "שלח כתיבה"}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", color: "#7a93b0", mt: 2 }}
        >
          {authorName ? `מחבר/ת: ${authorName}` : ""}
        </Typography>
      </Container>
    </Box>
  );
}

