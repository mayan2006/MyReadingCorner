const { z } = require("zod");

const requiredCode = z.string().trim().min(1, "שדה חובה חסר");

const toggleLikeSchema = z.object({
  body: z.object({
    bookCode: requiredCode
  })
});

const upsertRatingSchema = z.object({
  body: z.object({
    bookCode: requiredCode,
    stars: z.coerce.number().int().min(1, "דירוג חייב להיות בין 1 ל-5").max(5, "דירוג חייב להיות בין 1 ל-5")
  })
});

const addMarkedBookSchema = z.object({
  body: z.object({
    bookCode: requiredCode,
    name: z.string().trim().min(1, "שם הספר נדרש"),
    date: z.coerce.date().optional(),
    bookStatus: z.string().trim().min(1, "סטטוס נדרש")
  })
});

const addBookResponseSchema = z.object({
  body: z.object({
    bookCode: requiredCode,
    content: z
      .string()
      .trim()
      .min(1, "נא להזין תוכן לתגובה.")
      .max(2500, "התגובה ארוכה מדי (עד 2500 תווים).")
  })
});

const addFreeWritingSchema = z.object({
  body: z.object({
    writingCode: requiredCode,
    seriesCode: z.string().trim().optional(),
    subjectCode: z.string().trim().optional(),
    author: z.string().trim().min(1, "שם מחבר נדרש"),
    chapter: z.coerce.number().optional(),
    name: z.string().trim().min(1, "כותרת נדרשת"),
    summary: z.string().trim().min(1, "תקציר נדרש"),
    content: z.string().trim().min(1, "תוכן נדרש"),
    date: z.coerce.date().optional(),
    isApproved: z.boolean().optional()
  })
});

const updateFreeWritingSchema = z.object({
  body: z.object({
    subjectCode: z.string().trim().optional(),
    chapter: z.coerce.number().optional(),
    name: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    content: z.string().trim().optional(),
    author: z.string().trim().optional(),
    isApproved: z.boolean().optional()
  })
});

const uploadCoverSchema = z.object({
  body: z.object({
    writingCode: requiredCode
  })
});

const createSubjectRequestSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "שם נושא נדרש"),
    categoryCode: z.string().trim().optional(),
    img: z.string().optional()
  })
});

const approveSubjectSchema = z.object({
  body: z.object({
    categoryCode: z.string().trim().min(1, "חובה לבחור קטגוריה לפני אישור הנושא")
  })
});

module.exports = {
  toggleLikeSchema,
  upsertRatingSchema,
  addMarkedBookSchema,
  addBookResponseSchema,
  addFreeWritingSchema,
  updateFreeWritingSchema,
  uploadCoverSchema,
  createSubjectRequestSchema,
  approveSubjectSchema
};
