import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/apiBase";
import {
  getAllFreeWriting,
  getFreeWritingByWritingCode,
  getFreeWritingSeries
} from "../services/freeWritingApi";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { getBookLikeState, toggleBookLike } from "../services/bookLikeApi";
import { addMarkedBook, deleteMarkedBook, getAllMarkedBook } from "../services/markedBookApi";
import {
  addBookResponse,
  deleteBookResponse,
  getBookResponses
} from "../services/bookResponseApi";
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
  IconButton,
  Tooltip,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Divider
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

/** עברית במידה ויש בתוכן תו מאותיות העברית */
const textContainsHebrew = (value) => typeof value === "string" && /[\u0590-\u05FF]/.test(value);

const SingleBook = () => {
  const { bookCode } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [seriesChapters, setSeriesChapters] = useState([]);
  const [isFreeWritingBook, setIsFreeWritingBook] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [responseSubmitting, setResponseSubmitting] = useState(false);
  const [responseError, setResponseError] = useState("");

  const getCurrentUserCode = () => {
    const rawCurrentUser = localStorage.getItem("currentUser");
    if (rawCurrentUser) {
      try {
        return JSON.parse(rawCurrentUser)?.userCode || "";
      } catch {
        return localStorage.getItem("userCode") || "";
      }
    }
    return localStorage.getItem("userCode") || "";
  };

  const refreshLikes = useCallback(async () => {
    if (!bookCode) return;
    const userCode = getCurrentUserCode();
    const res = await getBookLikeState(bookCode, userCode);
    if (res && typeof res.count === "number") {
      setLikeCount(res.count);
      setLikedByMe(Boolean(res.likedByUser));
    }
  }, [bookCode]);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      setSeriesChapters([]);
      setIsFreeWritingBook(false);
      try {
        const res = await axios.get(`${API_BASE_URL}/books/code/${bookCode}`);
        setBook(res.data);
      } catch {
        try {
          const fw = await getFreeWritingByWritingCode(bookCode);
          if (fw && fw.writingCode && !fw.message) {
            const seriesKey = fw.seriesCode || fw.writingCode;
            const series = await getFreeWritingSeries(seriesKey);
            const list = Array.isArray(series) ? series : [];
            setSeriesChapters(list);
            setIsFreeWritingBook(true);
            setBook({
              title: fw.name || `כתיבה ${fw.writingCode}`,
              author: fw.author || fw.userCode || "",
              authorUserCode: fw.userCode || "",
              summary: fw.summary || "",
              content: fw.content || "",
              chapter: fw.chapter,
              writingCode: fw.writingCode
            });
          } else {
            const freeWritingList = await getAllFreeWriting();
            const matchedWriting = Array.isArray(freeWritingList)
              ? freeWritingList.find((writing) => writing.writingCode === bookCode)
              : null;

            if (!matchedWriting) {
              setError("No book found");
              return;
            }

            const seriesKey = matchedWriting.seriesCode || matchedWriting.writingCode;
            const series = await getFreeWritingSeries(seriesKey);
            const list = Array.isArray(series) ? series : [];
            setSeriesChapters(list);
            setIsFreeWritingBook(true);
            setBook({
              title: matchedWriting.name || `כתיבה ${matchedWriting.writingCode}`,
              author: matchedWriting.author || matchedWriting.userCode || "",
              authorUserCode: matchedWriting.userCode || "",
              summary: matchedWriting.summary || "",
              content: matchedWriting.content || "",
              chapter: matchedWriting.chapter,
              writingCode: matchedWriting.writingCode
            });
          }
        } catch (fallbackErr) {
          setError(fallbackErr.message || "No book found");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookCode]);

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  const fetchResponses = useCallback(async () => {
    if (!bookCode) return;
    setResponsesLoading(true);
    const data = await getBookResponses(bookCode);
    setResponsesLoading(false);
    setResponses(Array.isArray(data) ? data : []);
  }, [bookCode]);

  useEffect(() => {
    if (!bookCode || loading) return;
    fetchResponses();
  }, [bookCode, loading, fetchResponses]);

  useEffect(() => {
    const userCode = getCurrentUserCode();
    if (!userCode || !isFreeWritingBook || !seriesChapters.length) {
      setSavedForLater(false);
      return;
    }
    let cancelled = false;
    const codes = seriesChapters.map((c) => c.writingCode);
    (async () => {
      const marked = await getAllMarkedBook();
      if (cancelled) return;
      const saved =
        Array.isArray(marked) &&
        marked.some(
          (m) =>
            m.userCode === userCode &&
            m.bookStatus === "later" &&
            codes.includes(m.bookCode)
        );
      setSavedForLater(Boolean(saved));
    })();
    return () => {
      cancelled = true;
    };
  }, [bookCode, isFreeWritingBook, seriesChapters]);

  const handleToggleSaveLater = async () => {
    const userCode = getCurrentUserCode();
    if (!userCode || !isFreeWritingBook || !seriesChapters.length) return;
    const codes = seriesChapters.map((c) => c.writingCode);
    if (savedForLater) {
      for (const code of codes) {
        await deleteMarkedBook(code, userCode);
      }
      setSavedForLater(false);
      return;
    }
    const res = await addMarkedBook({
      bookCode: codes[0],
      name: seriesChapters[0]?.name || book?.title || "ללא שם",
      userCode,
      date: new Date(),
      bookStatus: "later"
    });
    if (res?.message === "Already marked" || res?.message === "MarkedBook added to DB") {
      setSavedForLater(true);
    }
  };

  const handleSubmitResponse = async () => {
    const uid = getCurrentUserCode();
    if (!uid) return;
    const trimmed = responseText.trim();
    if (!trimmed) {
      setResponseError("נא להזין תוכן לתגובה.");
      return;
    }
    if (trimmed.length > 2500) {
      setResponseError("התגובה ארוכה מדי (עד 2500 תווים).");
      return;
    }
    setResponseError("");
    setResponseSubmitting(true);
    try {
      const res = await addBookResponse({ bookCode, userCode: uid, content: trimmed });
      if (!res || res.message !== "response added") {
        const msg =
          typeof res === "string" ? res : res?.message || "לא ניתן לשלוח את התגובה";
        setResponseError(msg);
      } else {
        setResponseText("");
        await fetchResponses();
      }
    } finally {
      setResponseSubmitting(false);
    }
  };

  const handleDeleteResponse = async (id) => {
    const uid = getCurrentUserCode();
    if (!id || !uid) return;
    const del = await deleteBookResponse(id, uid);
    if (del?.message === "response deleted") {
      setResponses((prev) => prev.filter((r) => String(r._id) !== String(id)));
    }
  };

  const handleToggleLike = async () => {
    const userCode = getCurrentUserCode();
    if (!userCode) return;
    const res = await toggleBookLike(bookCode, userCode);
    if (res && typeof res.count === "number" && typeof res.liked === "boolean") {
      setLikeCount(res.count);
      setLikedByMe(res.liked);
    } else {
      refreshLikes();
    }
  };

  const chapterIndex = isFreeWritingBook
    ? seriesChapters.findIndex((c) => c.writingCode === bookCode)
    : -1;
  const hasChapterNav = isFreeWritingBook && seriesChapters.length > 1;
  const prevChapter = chapterIndex > 0 ? seriesChapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex >= 0 && chapterIndex < seriesChapters.length - 1
      ? seriesChapters[chapterIndex + 1]
      : null;

  if (loading) return <Typography sx={{ p: 4 }}>Loading book...</Typography>;
  if (error) return <Typography sx={{ p: 4, color: "error.main" }}>Error: {error}</Typography>;
  if (!book) return <Typography sx={{ p: 4 }}>No book found</Typography>;

  const userCode = getCurrentUserCode();
  const bodyIsHebrew = textContainsHebrew(book.content);

  return (
    <Box sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
      <Container maxWidth={false} sx={{ width: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            border: "1px solid #d8e8f8",
            background: "linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%)",
            boxShadow: "0 18px 40px rgba(41, 108, 173, 0.08)"
          }}
        >
          <Box sx={{ maxWidth: "min(52rem, 100%)", mx: "auto", width: "100%", textAlign: "center" }}>
          {hasChapterNav ? (
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              sx={{ mb: 2 }}
            >
              <Button
                variant="outlined"
                size="small"
                disabled={!prevChapter}
                onClick={() => prevChapter && navigate(`/books/${prevChapter.writingCode}`)}
              >
                פרק קודם
              </Button>
              <Typography variant="body2" sx={{ color: "#5d7ea0", fontWeight: 600 }}>
                פרק {book.chapter} מתוך {seriesChapters.length}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={!nextChapter}
                onClick={() => nextChapter && navigate(`/books/${nextChapter.writingCode}`)}
              >
                פרק הבא
              </Button>
            </Stack>
          ) : book.chapter != null ? (
            <Typography variant="body2" sx={{ color: "#5d7ea0", mb: 1, fontWeight: 600, textAlign: "center" }}>
              פרק {book.chapter}
            </Typography>
          ) : null}

          <Typography
            component="h1"
            variant="h3"
            sx={{
              mb: 1.5,
              textAlign: "center",
              fontFamily: '"Frank Ruhl Libre", "David", serif',
              fontWeight: 900,
              fontSize: { xs: "1.55rem", sm: "2rem", md: "2.35rem" },
              lineHeight: 1.2,
              letterSpacing: "0.01em",
              background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 48%, #a67c32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {book.title}
          </Typography>
          {book.author ? (
            <Typography sx={{ color: "#5d7ea0", mb: 1, textAlign: "center" }}>
              מאת:{" "}
              {book.authorUserCode ? (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => navigate(`/users/${book.authorUserCode}`)}
                  sx={{ verticalAlign: "baseline", fontWeight: 600, cursor: "pointer" }}
                >
                  {book.author}
                </Link>
              ) : (
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {book.author}
                </Box>
              )}
            </Typography>
          ) : null}
          
          <Box
            component="article"
            dir={bodyIsHebrew ? "rtl" : "ltr"}
            sx={{
              mt: 0.5,
              p: { xs: 2.25, sm: 3, md: 3.5 },
              borderRadius: 3,
              textAlign: "center",
              direction: bodyIsHebrew ? "rtl" : "ltr",
              border: "1px solid rgba(219, 234, 249, 0.95)",
              borderInlineStart: "3px solid rgba(166, 124, 50, 0.42)",
              background:
                "linear-gradient(165deg, rgba(255,255,255,0.92) 0%, rgba(245,251,255,0.72) 55%, rgba(255,253,248,0.45) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85)",
              width: "100%",
            }}
          >
            <Typography
              component="div"
              sx={{
                fontFamily: '"Heebo", "Segoe UI", sans-serif',
                lineHeight: 1.9,
                fontSize: { xs: "1.02rem", sm: "1.08rem", md: "1.1rem" },
                letterSpacing: bodyIsHebrew ? "0.02em" : "0.01em",
                fontWeight: 400,
                color: "#1a2d4a",
                whiteSpace: "pre-wrap",
                unicodeBidi: "plaintext",
                textAlign: "center",
              }}
            >
              {book.content}
            </Typography>
          </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 2,
              mt: 3,
              color: "#7a8aa3"
            }}
          >
            {isFreeWritingBook && seriesChapters.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
                <Tooltip
                  title={
                    !userCode
                      ? "התחברו כדי לשמור"
                      : savedForLater
                        ? "הסר את הספר מרשימת הקריאה"
                        : "שמור את כל הספר לקריאה בהמשך (מפרק ראשון)"
                  }
                >
                  <span>
                    <IconButton
                      onClick={handleToggleSaveLater}
                      disabled={!userCode}
                      aria-label={savedForLater ? "הסר מלקריאה בהמשך" : "שמור לקריאה בהמשך"}
                      sx={{ color: savedForLater ? "#1f5d99" : "#7a8aa3" }}
                    >
                      {savedForLater ? <BookmarkIcon fontSize="large" /> : <BookmarkBorderIcon fontSize="large" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <Typography variant="caption" sx={{ color: "#666", maxWidth: 100, textAlign: "center" }}>
                  לקריאה בהמשך
                </Typography>
              </Box>
            ) : null}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
              <Tooltip title={!userCode ? "התחברו כדי לסמן אהבה" : likedByMe ? "הסרת אהבה" : "אהבתי"}>
                <span>
                  <IconButton
                    onClick={handleToggleLike}
                    disabled={!userCode}
                    aria-label={likedByMe ? "הסר אהבה" : "אהבתי"}
                    sx={{ color: likedByMe ? "#e53935" : "#7a8aa3" }}
                  >
                    {likedByMe ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {likeCount} לייקים
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          dir="rtl"
          sx={{
            mt: 4,
            p: { xs: 2.5, md: 4 },
            borderRadius: 4,
            border: "1px solid rgba(201,166,106,0.35)",
            background:
              "linear-gradient(180deg, rgba(255,253,248,0.97) 0%, rgba(250,243,229,0.35) 100%)",
            boxShadow: "0 14px 36px rgba(62, 48, 28, 0.07)",
            direction: "rtl",
            textAlign: "right"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, justifyContent: "flex-start" }}>
            <ChatBubbleOutlineRoundedIcon sx={{ color: "#a67c32", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1a2d4a", textAlign: "right" }}>
              תגובות והארות
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#5c4a38", mb: 2.5, textAlign: "right" }}>
            שיתוף קצר אחרי הקריאה — הקהילה של הקוראים והכותבים.
          </Typography>

          <Divider sx={{ mb: 2.5, borderColor: "rgba(166,124,50,0.25)" }} />

          {userCode ? (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                placeholder="כתבו כאן תגובה או מחשבה על הספר…"
                value={responseText}
                onChange={(e) => {
                  setResponseText(e.target.value);
                  setResponseError("");
                }}
                disabled={responseSubmitting}
                inputProps={{ dir: "rtl", style: { textAlign: "right" } }}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.92)"
                  }
                }}
              />
              {responseError ? (
                <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, textAlign: "right" }}>
                  {responseError}
                </Typography>
              ) : null}
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                disableElevation
                disabled={responseSubmitting || !responseText.trim()}
                onClick={handleSubmitResponse}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  px: 3,
                  background: "linear-gradient(135deg, #1f5d99 0%, #2f7dd1 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #17487a 0%, #246cb7 100%)" }
                }}
              >
                {responseSubmitting ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "פרסום תגובה"
                )}
              </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#8b6914", mb: 3, fontWeight: 600, textAlign: "right" }}>
              התחברו כדי להוסיף תגובה.
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#5d7ea0", mb: 1.5, textAlign: "right" }}>
            {responsesLoading ? "טוען תגובות…" : `${responses.length} תגובות`}
          </Typography>

          {responsesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "flex-start", py: 3 }}>
              <CircularProgress size={32} sx={{ color: "#a67c32" }} />
            </Box>
          ) : responses.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#7a93b0", fontStyle: "italic", textAlign: "right" }}>
              עדיין אין תגובות — תהיו הראשונים.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ alignItems: "stretch" }}>
              {responses.map((r) => (
                <Paper
                  key={r._id}
                  elevation={0}
                  dir="rtl"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid rgba(47,125,209,0.12)",
                    bgcolor: "rgba(255,255,255,0.88)",
                    direction: "rtl",
                    textAlign: "right"
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0, textAlign: "right" }}>
                      <Typography sx={{ fontWeight: 700, color: "#1f5d99", textAlign: "right" }}>
                        {r.authorName || r.userCode}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#889cb5", display: "block", textAlign: "right" }}>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString("he-IL", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })
                          : ""}
                      </Typography>
                    </Box>
                    {userCode && r.userCode === userCode ? (
                      <Tooltip title="מחק תגובה">
                        <IconButton
                          size="small"
                          aria-label="מחק תגובה"
                          onClick={() => handleDeleteResponse(r._id)}
                          sx={{ color: "#a04848" }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                  </Stack>
                  <Typography
                    sx={{
                      mt: 1.25,
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.75,
                      color: "#36536f",
                      wordBreak: "break-word",
                      textAlign: "right"
                    }}
                  >
                    {r.content}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SingleBook;
