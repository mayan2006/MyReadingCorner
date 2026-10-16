/** OpenAPI 3 spec for Swagger UI at /api-docs */
const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "פינת הקריאה שלי — API",
    version: "1.0.0",
    description:
      "ספרייה דיגיטלית: קטלוג, כתיבה חופשית, לייקים והתחברות.\n\n" +
      "**אימות:** `POST /user/login` מחזיר `accessToken` וגם עוגיות httpOnly. " +
      "ב־Authorize הדביקו את הטוקן כ־Bearer, או השתמשו בעוגייה `accessToken`."
  },
  servers: [
    { url: "http://localhost:5000", description: "פיתוח מקומי" },
    { url: "https://myreadingcornerserver.onrender.com", description: "פרודקשן" }
  ],
  tags: [
    { name: "Auth", description: "הרשמה, התחברות וסשן" },
    { name: "Users", description: "פרופיל והעלאת תמונה" },
    { name: "Books", description: "קטלוג ספרים" },
    { name: "Likes", description: "לייקים לספר" },
    { name: "FreeWriting", description: "כתיבה חופשית" },
    { name: "Marked", description: "לקריאה בהמשך" },
    { name: "Responses", description: "תגובות לספר" },
    { name: "Ratings", description: "דירוגים" },
    { name: "Catalog", description: "קטגוריות ונושאים" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: { message: { type: "string", example: "נדרשת התחברות" } }
      },
      User: {
        type: "object",
        properties: {
          userCode: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "manager"] },
          img: { type: "string" }
        }
      },
      Book: {
        type: "object",
        properties: {
          bookCode: { type: "string" },
          title: { type: "string" },
          author: { type: "string" },
          summary: { type: "string" },
          categoryCode: { type: "string" },
          img: { type: "string" }
        }
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        }
      },
      SignupBody: {
        type: "object",
        required: ["userCode", "firstName", "lastName", "email", "password"],
        properties: {
          userCode: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          password: {
            type: "string",
            description: "לפחות 8 תווים, אות גדולה, אות קטנה ומספר"
          }
        }
      }
    }
  },
  paths: {
    "/user/login": {
      post: {
        tags: ["Auth"],
        summary: "התחברות",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } } }
        },
        responses: {
          200: {
            description: "התחברות הצליחה — עוגיות + accessToken",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                    accessToken: { type: "string" }
                  }
                }
              }
            }
          },
          401: { description: "אימייל או סיסמה שגויים", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/user/logout": {
      post: {
        tags: ["Auth"],
        summary: "התנתקות",
        responses: { 200: { description: "העוגיות נמחקו" } }
      }
    },
    "/user/refresh": {
      post: {
        tags: ["Auth"],
        summary: "רענון סשן (עוגיית refresh)",
        responses: {
          200: { description: "טוקנים חדשים" },
          401: { description: "נדרשת התחברות" }
        }
      }
    },
    "/user": {
      post: {
        tags: ["Auth"],
        summary: "הרשמה",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SignupBody" } } }
        },
        responses: {
          200: { description: "משתמש נוצר והתחבר" },
          400: { description: "ולידציה נכשלה" },
          409: { description: "אימייל כבר קיים" }
        }
      },
      get: {
        tags: ["Users"],
        summary: "כל המשתמשים (מנהל)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "רשימת משתמשים" }, 401: { description: "נדרשת התחברות" }, 403: { description: "אין הרשאה" } }
      }
    },
    "/user/me": {
      get: {
        tags: ["Users"],
        summary: "המשתמש המחובר",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "הפרופיל", content: { "application/json": { schema: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } } } } },
          401: { description: "נדרשת התחברות" }
        }
      }
    },
    "/user/public/{userCode}": {
      get: {
        tags: ["Users"],
        summary: "פרופיל ציבורי של מחבר",
        parameters: [{ name: "userCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "ספרים שכתב/אהב" }, 404: { description: "משתמש לא נמצא" } }
      }
    },
    "/user/upload-image": {
      post: {
        tags: ["Users"],
        summary: "העלאת תמונת פרופיל",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: { image: { type: "string", format: "binary" } }
              }
            }
          }
        },
        responses: { 200: { description: "התמונה עודכנה" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/books": {
      get: {
        tags: ["Books"],
        summary: "כל הספרים (אופציונלי: חיפוש)",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "חיפוש טקסט" },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { 200: { description: "רשימת ספרים" } }
      },
      post: {
        tags: ["Books"],
        summary: "הוספת ספר (מנהל)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "נוסף" }, 403: { description: "אין הרשאה" } }
      }
    },
    "/books/popular": {
      get: {
        tags: ["Books"],
        summary: "ספרים פופולריים (לייקים + דירוג)",
        parameters: [{ name: "limit", in: "query", schema: { type: "integer", default: 12 } }],
        responses: { 200: { description: "רשימה ממוינת" } }
      }
    },
    "/books/code/{bookCode}": {
      get: {
        tags: ["Books"],
        summary: "ספר לפי קוד",
        parameters: [{ name: "bookCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "הספר", content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } }, 404: { description: "לא נמצא" } }
      }
    },
    "/bookLike/book/{bookCode}": {
      get: {
        tags: ["Likes"],
        summary: "מצב לייקים לספר",
        parameters: [{ name: "bookCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "count + likedByUser" } }
      }
    },
    "/bookLike/toggle": {
      post: {
        tags: ["Likes"],
        summary: "סימון / ביטול לייק",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["bookCode"], properties: { bookCode: { type: "string" } } }
            }
          }
        },
        responses: { 200: { description: "liked + count" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/bookLike/me": {
      get: {
        tags: ["Likes"],
        summary: "הספרים שאהבתי",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "רשימת לייקים" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/FreeWriting": {
      get: {
        tags: ["FreeWriting"],
        summary: "כל הכתיבות החופשיות",
        responses: { 200: { description: "רשימה" } }
      },
      post: {
        tags: ["FreeWriting"],
        summary: "פרק / ספר חדש",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "נוצר" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/FreeWriting/by-code/{writingCode}": {
      get: {
        tags: ["FreeWriting"],
        summary: "כתיבה לפי קוד",
        parameters: [{ name: "writingCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "הכתיבה" }, 404: { description: "לא נמצא" } }
      }
    },
    "/FreeWriting/upload-cover": {
      post: {
        tags: ["FreeWriting"],
        summary: "העלאת כריכה",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["writingCode", "image"],
                properties: {
                  writingCode: { type: "string" },
                  image: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: { 200: { description: "הכריכה נשמרה" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/markedBook": {
      get: {
        tags: ["Marked"],
        summary: "רשימת לקריאה בהמשך",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "רשימה" }, 401: { description: "נדרשת התחברות" } }
      },
      post: {
        tags: ["Marked"],
        summary: "שמירה לקריאה בהמשך",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "נשמר" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/bookResponse/book/{bookCode}": {
      get: {
        tags: ["Responses"],
        summary: "תגובות לספר",
        parameters: [{ name: "bookCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "רשימת תגובות" } }
      }
    },
    "/bookResponse": {
      post: {
        tags: ["Responses"],
        summary: "הוספת תגובה",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["bookCode", "content"],
                properties: {
                  bookCode: { type: "string" },
                  content: { type: "string", maxLength: 2500 }
                }
              }
            }
          }
        },
        responses: { 200: { description: "נוספה" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/rating/summary/{bookCode}": {
      get: {
        tags: ["Ratings"],
        summary: "ממוצע דירוג לספר",
        parameters: [{ name: "bookCode", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "ממוצע ומספר דירוגים" } }
      }
    },
    "/rating": {
      post: {
        tags: ["Ratings"],
        summary: "דירוג 1–5",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "נשמר" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/category": {
      get: {
        tags: ["Catalog"],
        summary: "כל הקטגוריות",
        responses: { 200: { description: "רשימה" } }
      }
    },
    "/subject": {
      get: {
        tags: ["Catalog"],
        summary: "כל הנושאים",
        responses: { 200: { description: "רשימה" } }
      }
    },
    "/subject/user-request": {
      post: {
        tags: ["Catalog"],
        summary: "בקשת נושא חדש",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "נשלח לאישור" }, 401: { description: "נדרשת התחברות" } }
      }
    },
    "/subject/pending-approval": {
      get: {
        tags: ["Catalog"],
        summary: "נושאים ממתינים (מנהל)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "רשימה" }, 403: { description: "אין הרשאה" } }
      }
    }
  }
};

module.exports = { openapiSpec };
