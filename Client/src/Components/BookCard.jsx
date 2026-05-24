import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Typography, IconButton, Tooltip, Chip } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import {
  addMarkedBook,
  getAllMarkedBook,
  deleteMarkedBook
} from "../services/markedBookApi";
import { getBookLikeState, toggleBookLike } from "../services/bookLikeApi";
import {
  laterMarkedBookCode,
  laterSeriesWritingCodes
} from "../utils/freeWritingSeries";
import { resolveMediaUrl } from "../services/apiBase";

const BookCard = ({ book, onDelete, onLikeChange, onEdit }) => {
  const navigate = useNavigate();
  const [isSavedForLater, setIsSavedForLater] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);

  const rawCover = book?.imageUrl || book?.img || "";
  const coverSrc = rawCover ? resolveMediaUrl(rawCover) : "";

  const currentUserCode = useMemo(() => {
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      try {
        return JSON.parse(raw)?.userCode || "";
      } catch {
        return localStorage.getItem("userCode") || "";
      }
    }
    return localStorage.getItem("userCode") || "";
  }, []);

  const refreshLikes = useCallback(async () => {
    if (!book?.bookCode) return;
    const res = await getBookLikeState(book.bookCode, currentUserCode);
    if (res && typeof res.count === "number") {
      setLikeCount(res.count);
      setLikedByMe(Boolean(res.likedByUser));
    }
  }, [book?.bookCode, currentUserCode]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!currentUserCode || !book?.bookCode) return;
      try {
        const marked = await getAllMarkedBook();
        const seriesCodes = laterSeriesWritingCodes(book);
        setIsSavedForLater(
          Array.isArray(marked) &&
            marked.some(
              (i) =>
                i.userCode === currentUserCode &&
                i.bookStatus === "later" &&
                seriesCodes.includes(i.bookCode)
            )
        );
      } catch {
        setIsSavedForLater(false);
      }
    };
    checkSaved();
  }, [book?.bookCode, book?.seriesWritingCodes, currentUserCode]);

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  const handleSaveForLater = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserCode) return;

    if (isSavedForLater) {
      try {
        for (const code of laterSeriesWritingCodes(book)) {
          await deleteMarkedBook(code, currentUserCode);
        }
        setIsSavedForLater(false);
      } catch {
        /* silent */
      }
      return;
    }

    try {
      const response = await addMarkedBook({
        bookCode: laterMarkedBookCode(book),
        name: book.title || "ללא שם",
        userCode: currentUserCode,
        date: new Date(),
        bookStatus: "later"
      });
      if (response?.message === "Already marked") {
        setIsSavedForLater(true);
        return;
      }
      setIsSavedForLater(true);
    } catch {
      /* silent */
    }
  };

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserCode) return;
    const res = await toggleBookLike(book.bookCode, currentUserCode);
    if (res && typeof res.count === "number" && typeof res.liked === "boolean") {
      setLikeCount(res.count);
      setLikedByMe(res.liked);
      if (typeof onLikeChange === "function") {
        onLikeChange();
      }
    } else {
      refreshLikes();
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onDelete === "function") {
      onDelete(book);
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (book.authorUserCode) navigate(`/users/${book.authorUserCode}`);
  };

  const handleCardClick = () => navigate(`/books/${book.bookCode}`);

  return (
    <Box
      onClick={handleCardClick}
      sx={{
        position: "relative",
        cursor: "pointer",
        direction: "rtl",
        textAlign: "right",
        background:
          "linear-gradient(180deg, rgba(255,253,248,0.98) 0%, rgba(250,243,229,0.95) 100%)",
        border: "1px solid rgba(201,166,106,0.35)",
        borderRadius: 3,
        p: 2.5,
        boxShadow: "0 6px 20px rgba(62,48,28,0.08)",
        transition: "all .3s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        maxWidth: "100%",
        "&:before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #a67c32 0%, #d4af6a 50%, #a67c32 100%)"
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 32px rgba(62,48,28,0.16)",
          borderColor: "#b89552"
        }
      }}
    >
      {coverSrc ? (
        <Box
          component="img"
          src={coverSrc}
          alt={book.title || ""}
          sx={{
            width: "100%",
            height: { xs: 160, sm: 180 },
            objectFit: "cover",
            borderRadius: 2,
            mb: 1.5,
            boxShadow: "0 4px 14px rgba(62,48,28,0.18)",
            pointerEvents: "none"
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: { xs: 100, sm: 120 },
            mb: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #faf3e3 0%, #f0e3c8 100%)",
            color: "#a67c32",
            pointerEvents: "none"
          }}
        >
          <MenuBookIcon sx={{ fontSize: 56 }} />
        </Box>
      )}

      <Typography
        sx={{
          fontFamily: '"Frank Ruhl Libre", "David", serif',
          fontWeight: 800,
          fontSize: { xs: "1.15rem", sm: "1.35rem" },
          lineHeight: 1.2,
          width: "100%",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          background: "linear-gradient(135deg, #1a2d4a 0%, #3a5a8a 60%, #a67c32 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          mb: 0.75,
          pointerEvents: "none"
        }}
      >
        {book.title}
      </Typography>

      {book.chapterCount > 1 ? (
        <Chip
          label={`${book.chapterCount} פרקים`}
          size="small"
          sx={{
            alignSelf: "flex-start",
            mb: 1,
            fontFamily: '"Heebo", sans-serif',
            fontWeight: 600,
            color: "#7a5a14",
            backgroundColor: "rgba(166,124,50,0.12)",
            border: "1px solid rgba(166,124,50,0.3)",
            pointerEvents: "none"
          }}
        />
      ) : null}

      <Typography
        onClick={handleAuthorClick}
        sx={{
          fontFamily: '"Heebo", sans-serif',
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#8b6914",
          mb: 1,
          cursor: book.authorUserCode ? "pointer" : "default",
          transition: "color .2s",
          ...(book.authorUserCode
            ? {
                "&:hover": { color: "#a67c32", textDecoration: "underline" }
              }
            : {})
        }}
      >
        ✍︎ {book.author}
      </Typography>

      {book.summary ? (
        <Typography
          sx={{
            fontFamily: '"Heebo", sans-serif',
            fontSize: "0.88rem",
            color: "#5c4a38",
            lineHeight: 1.55,
            mb: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            pointerEvents: "none"
          }}
        >
          {book.summary}
        </Typography>
      ) : null}

      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1,
          mt: "auto",
          borderTop: "1px dashed rgba(201,166,106,0.4)",
          borderBottom: "1px dashed rgba(201,166,106,0.4)",
          mb: 1
        }}
      >
        <Tooltip
          title={
            !currentUserCode ? "התחברו כדי לסמן אהבה" : likedByMe ? "בטל לייק" : "אהבתי"
          }
        >
          <span>
            <IconButton
              onClick={handleLikeClick}
              disabled={!currentUserCode}
              size="small"
              aria-label={likedByMe ? "הסר אהבה" : "אהבתי"}
              sx={{
                color: likedByMe ? "#d4326a" : "#a67c32",
                transition: "transform .2s",
                "&:hover": {
                  transform: "scale(1.15)",
                  backgroundColor: "rgba(212,50,106,0.08)"
                }
              }}
            >
              {likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </span>
        </Tooltip>
        <Typography
          sx={{
            fontFamily: '"Heebo", sans-serif',
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#5c4a38"
          }}
        >
          {likeCount} לייקים
        </Typography>
      </Box>

      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Box>
          {typeof onDelete === "function" ? (
            <Tooltip title="מחיקה">
              <IconButton
                onClick={handleDeleteClick}
                size="small"
                aria-label="delete my book"
                sx={{
                  color: "#a04848",
                  "&:hover": { backgroundColor: "rgba(160,72,72,0.1)" }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {typeof onEdit === "function" ? (
            <Tooltip title="המשך עריכה">
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(book);
                }}
                size="small"
                aria-label="continue editing"
                sx={{
                  color: "#1f5d99",
                  "&:hover": { backgroundColor: "rgba(31,93,153,0.1)" }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip
            title={
              !currentUserCode
                ? "התחברו כדי לשמור לקריאה בהמשך"
                : isSavedForLater
                  ? "הסר משמירה"
                  : "שמור להמשך"
            }
          >
            <span>
              <IconButton
                onClick={handleSaveForLater}
                disabled={!currentUserCode}
                size="small"
                aria-label={isSavedForLater ? "הסר מלקריאה בהמשך" : "שמור לקריאה בהמשך"}
                sx={{
                  color: isSavedForLater ? "#a67c32" : "#8b6914",
                  transition: "transform .2s",
                  "&:hover": {
                    transform: "scale(1.15)",
                    backgroundColor: "rgba(166,124,50,0.1)"
                  }
                }}
              >
                {isSavedForLater ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default BookCard;
