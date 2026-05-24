/** קטגוריות ספרים — זהה לטאבים ב-Navbar (ללא "הכל") */
export const BOOK_CATEGORIES = [
  "פנטזיה",
  "רומנטיקה",
  "מתח",
  "נוער",
  "ספרי משתמשים"
];

export const NAV_CATEGORY_TABS = ["all", ...BOOK_CATEGORIES];

/** קטגוריה ברירת מחדל לנושא חדש מכתיבה חופשית (מוצג ב-Navbar בלי צורך בעריכת DB) */
export const DEFAULT_SUBJECT_CATEGORY = "ספרי משתמשים";

/** השוואה אמינה בין שם קטגוריה מהשרת לטאב ב-Navbar (RTL marks, רווחים, Unicode) */
export const normalizeNavCategory = (value) =>
  (typeof value === "string" ? value : "")
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .trim()
    .normalize("NFC");
