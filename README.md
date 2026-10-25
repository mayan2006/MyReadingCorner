# ספריה דיגיטלית — My Reading Corner

אפליקציית **ספריה דיגיטלית** בעברית (RTL) לקריאה, כתיבה חופשית וניהול ספרים אישיים.  
הפרויקט בנוי כ־**Full Stack**: לקוח React + שרת Node.js/Express + MongoDB (Atlas).

קישור חי: [https://myreadingcorner-1.onrender.com/](https://myreadingcorner-1.onrender.com/)  
API: [https://myreadingcornerserver.onrender.com](https://myreadingcornerserver.onrender.com) · Swagger: [/api-docs](https://myreadingcornerserver.onrender.com/api-docs)

---

## תוכן עניינים

- [מה האפליקציה עושה](#מה-האפליקציה-עושה)
- [ארכיטקטורה](#ארכיטקטורה)
- [מבנה התיקיות](#מבנה-התיקיות)
- [מודל הנתונים](#מודל-הנתונים)
- [API — נקודות קצה עיקריות](#api--נקודות-קצה-עיקריות)
- [זמן אמת — Socket.io](#זמן-אמת--socketio)
- [נתיבים בלקוח (React Router)](#נתיבים-בלקוח-react-router)
- [התקנה והרצה](#התקנה-והרצה)
- [פריסה](#פריסה)
- [משתני סביבה](#משתני-סביבה)
- [קטגוריות ונושאים](#קטגוריות-ונושאים)
- [תפקידים והרשאות](#תפקידים-והרשאות)

---

## מה האפליקציה עושה

| יכולת | תיאור |
|--------|--------|
| **קטלוג ספרים** | הצגת ספרים לפי קטגוריות ב-Navbar, עם קרוסלות בדף הבית וסינון לפי נושא |
| **קריאת ספר** | עמוד ספר בודד עם כותרת, מחבר, תוכן, לייקים, שמירה ל«לקריאה בהמשך» ותגובות |
| **עדכונים חיים** | לייק ותגובה מתעדכנים אצל מי שמסתכל על אותו ספר, בלי רענון |
| **כתיבה חופשית** | יצירת ספרים/פרקים על ידי משתמשים, כולל סדרות, כריכה ונושא |
| **פרופיל אישי** | ספרים אהובים, ספרים שכתבתי, לקריאה בהמשך, העלאת תמונת פרופיל, Dark Mode |
| **פרופיל ציבורי** | צפייה בספרים שכתב/ה ואהב/ה משתמש אחר |
| **ניהול נושאים** | מנהל מאשר נושאים חדשים ומשייך אותם לקטגוריה |
| **חיפוש** | חיפוש ספרים ב-Navbar (קטלוג + כתיבות חופשית) דרך השרת |

---

## ארכיטקטורה

```
┌─────────────────────────────────────────────────────────────┐
│                        דפדפן (RTL)                          │
│  React 19 + Vite + MUI + React Router                       │
│  TanStack Query │ Socket.io-client │ Auth / Socket context  │
└───────────────┬─────────────────────────────┬───────────────┘
                │ HTTP (axios + cookies)      │ WebSocket
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Express 5 + Socket.io — Server/server.js            │
│  JWT httpOnly cookies · Zod · helmet · Pino                 │
│  Routes → Controllers → Mongoose Models                     │
│  /api-docs — Swagger   ·  /health                           │
└───────────────┬─────────────────────────────┬───────────────┘
                │ MONGODB_URI                 │ Cloudinary
                ▼                             ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│  MongoDB Atlas (או מקומי)    │   │  תמונות פרופיל וכריכות   │
│  Database: mySiteDB          │   │  (נפילה ל-/uploads)      │
└──────────────────────────────┘   └──────────────────────────┘
```

### זרימת נתונים טיפוסית

1. **רכיב React** קורא ל-**שירות API** (`services/*Api.js`) או ל-TanStack Query.
2. השירות שולח בקשה ל-**Express Router**. השרת מזהה את המשתמש מ-JWT (`req.user`).
3. ה-**Controller** שומר ב-Mongo. אחרי לייק/תגובה הוא משדר לחדר `book:<קוד>` ב-Socket.io.
4. לקוחות בחדר מעדכנים cache / רשימת תגובות בלי רענון.

### שכבות בצד הלקוח

| שכבה | תפקיד | דוגמאות |
|------|--------|---------|
| **Components** | UI, טפסים, עמודים | `Navbar`, `BooksPage`, `SingleBook`, `FreeWriting` |
| **services** | תקשורת עם השרת | `booksApi.js`, `UserAPI.js`, `socketClient.js` |
| **hooks** | שאילתות וחדר ספר | `useBookLike`, `useBookRoom` |
| **context** | מצב גלובלי | `AuthContext`, `SocketContext`, `SiteBackgroundContext` |
| **constants / utils** | קבועים ועזר | `bookCategories.js`, `freeWritingSeries.js` |

---

## מבנה התיקיות

```
MyReadingCorner/
├── .github/workflows/ci.yml   # Jest + Vitest בכל push
├── docker-compose.yml         # API + Mongo לדמו מקומי
├── Client/                    # אפליקציית React (Vite)
│   └── src/
│       ├── Components/
│       ├── context/           # Auth, Socket, רקע כהה
│       ├── hooks/
│       ├── services/
│       ├── constants/
│       ├── utils/
│       ├── queryKeys.js
│       ├── App.jsx
│       └── main.jsx
│
└── Server/
    ├── server.js              # HTTP server + Socket.io
    ├── app.js
    ├── .env                   # סודות מקומיים (לא ב-Git)
    ├── .env.example
    ├── config/                # CORS origins משותפים
    ├── realtime/              # Socket.io — חדרים ושידור
    ├── docs/                  # OpenAPI + Swagger UI
    ├── scripts/               # seed לנתוני דמו
    ├── tests/
    ├── Controllers/
    ├── Models/
    ├── Routes/
    ├── middleware/
    └── uploads/               # נפילה כשאין Cloudinary
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

מפרט מלא ב-[Swagger UI](https://myreadingcornerserver.onrender.com/api-docs) (`/api-docs` גם מקומית).

| Prefix | שימוש |
|--------|--------|
| `GET /health` | בדיקת חיות ל-CI / Render |
| `GET/POST /books` | רשימת ספרים, חיפוש עם `?q=&page=&limit=`, הוספה |
| `GET /books/code/:bookCode` | ספר לפי קוד |
| `GET /books/popular` | ספרים לפי לייקים/דירוג (aggregation) |
| `GET/POST /category` | קטגוריות |
| `GET/POST /FreeWriting` | כתיבה חופשית + העלאת כריכה |
| `GET/POST /user` | הרשמה, התחברות, refresh, logout, `GET /user/me` |
| `GET /user/public/:userCode` | פרופיל ציבורי + ספרים |
| `GET/POST /subject` | נושאים + אישור מנהל |
| `GET/POST /bookLike` | לייקים |
| `GET/POST /markedBook` | לקריאה בהמשך |
| `GET/POST /bookResponse` | תגובות על ספר |
| `GET/POST /rating` | דירוגים + סיכום ממוצע |

השרת רץ כברירת מחדל על **`http://localhost:5000`**.

---

## זמן אמת — Socket.io

הכתיבה נשארת ב-HTTP (Mongo). אחרי שמירה השרת משדר לחדר `book:<bookCode>`.

| כיוון | אירוע | משמעות |
|--------|--------|---------|
| לקוח → שרת | `joinBook` / `leaveBook` | כניסה/יציאה מחדר הספר |
| שרת → חדר | `likeUpdated` | מספר לייקים + מי לחץ |
| שרת → חדר | `responseAdded` / `responseDeleted` | תגובה חדשה או מחיקה |

מקומית Vite מעביר גם את ה-WebSocket דרך `/api` (`ws: true`). בפרודקשן הלקוח מתחבר ישירות לכתובת ה-API.

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

- Node.js 18+ (ב-CI ו-Docker: 22)
- MongoDB Atlas (או MongoDB מקומי / Docker)

### 1. שרת (Backend)

```bash
cd Server
npm install
```

צרי קובץ `Server/.env` (ראו [משתני סביבה](#משתני-סביבה)).

```bash
npm run dev    # nodemon — לפיתוח מקומי
npm start      # node server.js — כמו ב-Render
npm test       # Jest + Mongo בזיכרון
npm run seed   # נתוני דמו (משתמשים + ספרים)
```

### 2. לקוח (Frontend)

```bash
cd Client
npm install
npm run dev
npm test
```

פתחי בדפדפן את הכתובת ש-Vite מציג (בדרך כלל `http://localhost:5173`).

### 3. (אופציונלי) כתובת API מותאמת

העתיקי את `Client/.env.example` ל-`Client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

בלי זה, בפיתוח Vite מעביר `/api` ל-`localhost:5000`.

### 4. (אופציונלי) Docker לדמו

```bash
docker compose up --build
docker compose --profile seed run --rm seed
```

ה-API יהיה על `http://localhost:5000`. זה דמו מקומי, לא תחליף ל-Render + Atlas.

---

## פריסה

| חלק | איפה רץ |
|------|---------|
| לקוח | Render static — [myreadingcorner-1.onrender.com](https://myreadingcorner-1.onrender.com/) |
| שרת | Render Web Service — [myreadingcornerserver.onrender.com](https://myreadingcornerserver.onrender.com) |
| DB | MongoDB Atlas |

השרת מאזין ל-`process.env.PORT` (Render מספק את זה). מקומית ברירת המחדל היא 5000.

הלקוח וה-API הם שני שירותי Render נפרדים (סיומת ציבורית `onrender.com`). לכן עוגיות האימות הן `SameSite=None; Secure`. ב-iPhone Safari, אם עוגיית צד שלישי נחסמת, הלקוח שולח גם `Authorization: Bearer`.

ב-Dashboard של Render (לא ב-Git) צריך:

| משתנה | ערך בפרודקשן |
|--------|----------------|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | כתובת האתר החי (כדי ש-CORS ו-cookies יעבדו) |
| `MONGODB_URI` | קישור Atlas |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | אותם סודות כמו בפיתוח, או סודות ייעודיים לפרודקשן |
| `CLOUDINARY_*` | כדי שתמונות לא יימחקו בכל deploy |
| `VITE_API_BASE_URL` | כתובת ה-API החי (בבניית הלקוח), למשל `https://myreadingcornerserver.onrender.com` |

CI: GitHub Actions מריץ את בדיקות השרת והלקוח בכל push ל-`main`.

---

## משתני סביבה

### Server — `Server/.env`

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/mySiteDB?retryWrites=true&w=majority
JWT_ACCESS_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-another-long-random-string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| משתנה | תיאור |
|--------|--------|
| `MONGODB_URI` | קישור MongoDB Atlas או מקומי. שם DB מומלץ: **`mySiteDB`** |
| `JWT_ACCESS_SECRET` | סוד לחתימת access token (קצר) |
| `JWT_REFRESH_SECRET` | סוד לחתימת refresh token (ארוך) |
| `CLIENT_URL` | כתובת הלקוח ל-CORS (אפשר כמה כתובות מופרדות בפסיק) |
| `NODE_ENV` | `development` מקומית, `production` ב-Render |
| `PORT` | פורט השרת. מקומית 5000; ב-Render מגיע אוטומטית |
| `CLOUDINARY_*` | העלאת פרופיל וכריכה לענן. בלי זה הקבצים נשמרים ב-`Server/uploads` |

### Client — `Client/.env` (מ-`Client/.env.example`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

> **אל תעלי את `.env` ל-Git.** הקובץ כבר ב-`.gitignore`.

### Atlas — הגדרות נדרשות

- **Database Access** — משתמש עם **Read and write** על `mySiteDB`
- **Network Access** — IP מורשה (לפיתוח: `0.0.0.0/0`)

---

## קטגוריות ונושאים

טאבי ה-Navbar מוגדרים ב-`Client/src/constants/bookCategories.js`:

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

התחברות מתבצעת עם **JWT** (access + refresh) ב-**httpOnly cookies**, ובמקביל `accessToken` ב-JSON ל-Bearer (Safari באייפון).  
השרת מזהה את המשתמש מהטוקן (`authenticate` / `authorize`) ולא מ-`userCode` שנשלח מהלקוח.  
סיסמאות מוצפנות בשרת עם **bcrypt**.

---

## טכנולוגיות

| שכבה | טכנולוגיה |
|------|-----------|
| Frontend | React 19, Vite 7, MUI 7, React Router 7, Axios, TanStack Query |
| Backend | Node.js, Express 5, Mongoose 9, Socket.io, Pino |
| DB | MongoDB / MongoDB Atlas |
| Auth | bcrypt, JWT (httpOnly cookies + Bearer), middleware authenticate/authorize |
| אבטחת שרת | Zod, helmet, express-rate-limit, express-mongo-sanitize, error middleware |
| קבצים | Multer + Cloudinary (JPEG/PNG/WebP, עד 2MB; נפילה ל-`/uploads`) |
| חיפוש ו־DB | אינדקסים, `$text`, aggregation, עימוד |
| זמן אמת | Socket.io — חדר לכל ספר (`likeUpdated`, `responseAdded`) |
| תיעוד ו־CI | Swagger `/api-docs`, GitHub Actions, Docker Compose, seed |

---

## פיתוח נוסף — רעיונות

- JWT, אבטחה, בדיקות, פריסה, React Query, Swagger/CI/Docker, Socket.io — בוצע
- TypeScript או Playwright אם יישאר זמן
- פעמון התראות (אישור נושא) בנוסף לעדכונים החיים בספר

---

## רישיון

פרויקט לימודי / אישי — עדכני לפי צורך.
