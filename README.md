# ספריה דיגיטלית — My Reading Corner

אפליקציית **ספריה דיגיטלית** בעברית (RTL) לקריאה, כתיבה חופשית וניהול ספרים אישיים.  
הפרויקט בנוי כ־**Full Stack**: לקוח React + שרת Node.js/Express + MongoDB (Atlas).

---

## תוכן עניינים

- [מה האפליקציה עושה](#מה-האפליקציה-עושה)
- [ארכיטקטורה](#ארכיטקטורה)
- [מבנה התיקיות](#מבנה-התיקיות)
- [מודל הנתונים](#מודל-הנתונים)
- [API — נקודות קצה עיקריות](#api--נקודות-קצה-עיקריות)
- [נתיבים בלקוח (React Router)](#נתיבים-בלקוח-react-router)
- [התקנה והרצה](#התקנה-והרצה)
- [משתני סביבה](#משתני-סביבה)
- [קטגוריות ונושאים](#קטגוריות-ונושאים)
- [תפקידים והרשאות](#תפקידים-והרשאות)

---

## מה האפליקציה עושה

| יכולת | תיאור |
|--------|--------|
| **קטלוג ספרים** | הצגת ספרים לפי קטגוריות ב-Navbar, עם קרוסלות בדף הבית וסינון לפי נושא |
| **קריאת ספר** | עמוד ספר בודד עם כותרת, מחבר, תוכן, לייקים, שמירה ל«לקריאה בהמשך» ותגובות |
| **כתיבה חופשית** | יצירת ספרים/פרקים על ידי משתמשים, כולל סדרות, כריכה ונושא |
| **פרופיל אישי** | ספרים אהובים, ספרים שכתבתי, לקריאה בהמשך, העלאת תמונת פרופיל, Dark Mode |
| **פרופיל ציבורי** | צפייה בספרים שכתב/ה ואהב/ה משתמש אחר |
| **ניהול נושאים** | מנהל מאשר נושאים חדשים ומשייך אותם לקטגוריה |
| **חיפוש** | חיפוש ספרים ב-Navbar (קטלוג + כתיבות חופשית) |

---

## ארכיטקטורה

```
┌─────────────────────────────────────────────────────────────┐
│                        דפדפן (RTL)                          │
│  React 19 + Vite + MUI + React Router                       │
│  Components │ services/*Api.js │ context/                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (axios) — localhost:5000
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Express 5 — Server/server.js                   │
│  Routes → Controllers → Mongoose Models                     │
│  /uploads — קבצים סטטיים (תמונות פרופיל, כריכות)          │
└──────────────────────────┬──────────────────────────────────┘
                           │ MONGODB_URI
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           MongoDB Atlas (או MongoDB מקומי)                  │
│  Database: mySiteDB                                           │
│  Collections: books, categories, users, freewritings, …     │
└─────────────────────────────────────────────────────────────┘
```

### זרימת נתונים טיפוסית

1. **רכיב React** (`Components/`) קורא ל-**שירות API** (`services/*Api.js`).
2. השירות שולח בקשה ל-**Express Router** (`Server/Routes/`).
3. ה-Router מפעיל **Controller** (`Server/Controllers/`) שמבצע לוגיקה וקריאות ל-**Model** (`Server/Models/`).
4. **Mongoose** שומר/קורא מ-MongoDB ומחזיר JSON ללקוח.

### שכבות בצד הלקוח

| שכבה | תפקיד | דוגמאות |
|------|--------|---------|
| **Components** | UI, טפסים, עמודים | `Navbar`, `BooksPage`, `SingleBook`, `FreeWriting` |
| **services** | תקשורת עם השרת | `booksApi.js`, `UserAPI.js`, `freeWritingApi.js` |
| **constants** | קבועים משותפים | `bookCategories.js` |
| **context** | מצב גלובלי | `SiteBackgroundContext` (רקע כהה) |
| **utils** | עזר | `freeWritingSeries.js` — קיבוץ פרקים לסדרה |

---

## מבנה התיקיות

```
Library/
├── Client/
│   └── vite-project/          # אפליקציית React
│       ├── public/            # תמונות סטטיות (לוגו, placeholders)
│       └── src/
│           ├── Components/    # רכיבי UI
│           ├── services/      # קריאות API
│           ├── constants/     # קטגוריות Navbar
│           ├── context/       # Context (Dark Mode)
│           ├── utils/         # לוגיקת סדרות כתיבה
│           ├── App.jsx        # ניתוב + מצב משתמש
│           └── main.jsx
│
└── Server/
    ├── server.js              # נקודת כניסה — Express + MongoDB
    ├── .env                   # MONGODB_URI (לא ב-Git)
    ├── Controllers/           # לוגיקה עסקית
    ├── Models/                # סכמות Mongoose
    ├── Routes/                # ניתוב API
    └── uploads/               # קבצים שהועלו (תמונות)
```

---

## מודל הנתונים

| Collection (Mongoose) | תיאור | שדות עיקריים |
|------------------------|--------|---------------|
| **books** | ספרי קטלוג | `bookCode`, `categoryCode`, `title`, `author`, `summary`, `img`, `content` |
| **categories** | קטגוריות לסינון | `categoryCode`, `name` |
| **users** | משתמשים | `userCode`, `firstName`, `lastName`, `email`, `password`, `role`, `img` |
| **freewritings** | כתיבה חופשית / פרקים | `writingCode`, `seriesCode`, `subjectCode`, `chapter`, `name`, `content`, `isApproved` |
| **subjects** | נושאים לספרים | `subjectCode`, `name`, `categoryCode`, `managerApproved` |
| **booklikes** | לייקים לספר | `bookCode`, `userCode` |
| **markedbooks** | לקריאה בהמשך | `bookCode`, `userCode`, `bookStatus` |
| **bookresponses** | תגובות על ספר | `bookCode`, `userCode`, `content` |
| **ratings** | דירוגים | `bookCode`, `userCode`, `rating` |

> **הערה:** ספרי «ספרי משתמשים» מגיעים גם מ-`freewritings` — הלקוח מקבץ פרקים לפי `seriesCode` ומציג אותם ככרטיס ספר אחד.

---

## API — נקודות קצה עיקריות

| Prefix | שימוש |
|--------|--------|
| `GET/POST /books` | רשימת ספרים, הוספה, עדכון, מחיקה |
| `GET /books/code/:bookCode` | ספר לפי קוד |
| `GET/POST /category` | קטגוריות |
| `GET/POST /FreeWriting` | כתיבה חופשית + העלאת כריכה |
| `GET/POST /user` | הרשמה, התחברות, פרופיל, תמונה |
| `GET /user/public/:userCode` | פרופיל ציבורי + ספרים |
| `GET/POST /subject` | נושאים + אישור מנהל |
| `GET/POST /bookLike` | לייקים |
| `GET/POST /markedBook` | לקריאה בהמשך |
| `GET/POST /bookResponse` | תגובות על ספר |
| `GET/POST /rating` | דירוגים |

השרת רץ כברירת מחדל על **`http://localhost:5000`**.

---

## נתיבים בלקוח (React Router)

| נתיב | עמוד |
|------|------|
| `/` | דף הבית — קטלוג ספרים (`BooksPage`) |
| `/books/:bookCode` | קריאת ספר (`SingleBook`) |
| `/users/:userCode` | פרופיל מחבר ציבורי |
| `/FreeWriting` | כתיבה חופשית — יצירה |
| `/FreeWriting/edit/:writingCode` | עריכת כתיבה |
| `/Profile` | פרופיל אישי |
| `/my-books` | ספרים שכתבתי |
| `/favorites` | ספרים אהובים |
| `/later` | לקריאה בהמשך |
| `/login` / `/signup` | התחברות / הרשמה |
| `/manager/subjects` | אישור נושאים (מנהל) |

בעמודים מסוימים ה-Navbar מוחלף ב-`BackToHomeBar` (קריאה, פרופיל, כתיבה וכו').

---

## התקנה והרצה

### דרישות

- Node.js 18+
- MongoDB Atlas (או MongoDB מקומי)

### 1. שרת (Backend)

```bash
cd Server
npm install
```

צרי קובץ `Server/.env` (ראו [משתני סביבה](#משתני-סביבה)).

```bash
npm start
```

אמור להופיע: `server is connected to mongoDB` ו-`(MongoDB Atlas)`.

### 2. לקוח (Frontend)

```bash
cd Client/vite-project
npm install
npm run dev
```

פתחי בדפדפן את הכתובת ש-Vite מציג (בדרך כלל `http://localhost:5173`).

### 3. (אופציונלי) כתובת API מותאמת

ב-`Client/vite-project` אפשר ליצור `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## משתני סביבה

### Server — `Server/.env`

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mySiteDB?retryWrites=true&w=majority
```

| משתנה | תיאור |
|--------|--------|
| `MONGODB_URI` | קישור MongoDB Atlas או מקומי. שם DB מומלץ: **`mySiteDB`** |

> **אל תעלי את `.env` ל-Git.** הקובץ כבר ב-`.gitignore`.

### Atlas — הגדרות נדרשות

- **Database Access** — משתמש עם **Read and write** על `mySiteDB`
- **Network Access** — IP מורשה (לפיתוח: `0.0.0.0/0`)

---

## קטגוריות ונושאים

טאבי ה-Navbar מוגדרים ב-`Client/vite-project/src/constants/bookCategories.js`:

- **הכל**
- פנטזיה
- רומנטיקה
- מתח
- נוער
- ספרי משתמשים

**נושאים** (`subjects`) משויכים לקטגוריה דרך `categoryCode`.  
משתמש יכול לבקש **נושא חדש** בכתיבה חופשית; **מנהל** מאשר ב-`/manager/subjects`.

---

## תפקידים והרשאות

| תפקיד | יכולות |
|--------|--------|
| **user** | קריאה, לייק, תגובות, כתיבה חופשית, רשימות אישיות |
| **manager** | + אישור נושאים חדשים ושיוך לקטגוריה |

התחברות נשמרת ב-`localStorage` תחת `currentUser`.  
סיסמאות מוצפנות בשרת עם **bcrypt**.

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React 19, Vite 7, MUI 7, React Router 7, Axios |
| Backend | Node.js, Express 5, Mongoose 9 |
| DB | MongoDB / MongoDB Atlas |
| Auth | bcrypt, localStorage (לקוח) |
| קבצים | Multer (`Server/uploads`) |

---

## פיתוח נוסף — רעיונות

- JWT / sessions במקום זיהוי משתמש דרך `userCode` בלבד
- העברת כל קבועי הקטגוריות ל-DB בלבד
- בדיקות אוטומטיות (API + רכיבים)
- פריסה (Render / Railway / Vercel + Atlas)

---

## רישיון

פרויקט לימודי / אישי — עדכני לפי צורך.
