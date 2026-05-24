import { resolveMediaUrl } from "../services/apiBase";

/** Canonical series id: same for all chapters in one book */
export const seriesKeyForWriting = (w) => w?.seriesCode || w?.writingCode || "";

/** Writing codes in this card's series (first = anchor stored in markedBook as bookCode). */
export const laterSeriesWritingCodes = (book) => {
  if (Array.isArray(book?.seriesWritingCodes) && book.seriesWritingCodes.length > 0) {
    return book.seriesWritingCodes;
  }
  if (book?.bookCode) return [book.bookCode];
  return [];
};

/** Single bookCode to persist for "read later" (opens series from chapter 1). */
export const laterMarkedBookCode = (book) => {
  const codes = laterSeriesWritingCodes(book);
  return codes[0] || book?.bookCode || "";
};

export const sortChaptersAsc = (a, b) => {
  const ca = Number(a?.chapter) || 0;
  const cb = Number(b?.chapter) || 0;
  if (ca !== cb) return ca - cb;
  return String(a?.writingCode || "").localeCompare(String(b?.writingCode || ""));
};

/**
 * Group DB rows into one entry per book (series).
 * @param {Array<object>} items
 * @returns {Array<{ seriesKey: string, chapters: object[], first: object, last: object, chapterCount: number }>}
 */
export const groupFreeWritingsBySeries = (items) => {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const by = new Map();
  for (const w of list) {
    const key = seriesKeyForWriting(w);
    if (!key) continue;
    if (!by.has(key)) by.set(key, []);
    by.get(key).push(w);
  }
  const out = [];
  for (const [seriesKey, chapters] of by) {
    const sorted = [...chapters].sort(sortChaptersAsc);
    out.push({
      seriesKey,
      chapters: sorted,
      first: sorted[0],
      last: sorted[sorted.length - 1],
      chapterCount: sorted.length
    });
  }
  return out;
};

/**
 * One card per series for grids / search.
 * @param {{ seriesKey: string, chapters: object[], first: object, last: object, chapterCount: number }} group
 * @param {string} fallbackImg
 */
export const mapSeriesGroupToCatalogBook = (group, fallbackImg) => {
  const { first, last, chapterCount, seriesKey, chapters } = group;
  const fallbackSummarySource = (first.content || "").trim();
  const fallbackSummary =
    fallbackSummarySource.length > 120
      ? `${fallbackSummarySource.slice(0, 120)}...`
      : fallbackSummarySource;

  const rawCover =
    (first.img && String(first.img).trim()) ||
    chapters.find((c) => c.img && String(c.img).trim())?.img ||
    "";
  const coverUrl = rawCover ? resolveMediaUrl(rawCover) : "";

  return {
    seriesKey,
    bookCode: first.writingCode,
    editWritingCode: last.writingCode,
    seriesWritingCodes: chapters.map((c) => c.writingCode),
    chapterCount,
    /** לסינון לפי נושא מה־Navbar */
    subjectCode: first.subjectCode || "",
    categoryCode: "ספרי משתמשים",
    title: first.name || `כתיבה ${first.writingCode}`,
    author: first.author || first.userCode || "משתמש",
    authorUserCode: first.userCode || "",
    summary: first.summary || fallbackSummary || "כתיבה חופשית של משתמש",
    img: coverUrl || fallbackImg,
    content: first.content || "",
    /** Lowercase string for search across all chapter titles + author */
    searchHaystack: [
      first.author,
      first.userCode,
      ...chapters.map((c) => c.name || "")
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
  };
};
