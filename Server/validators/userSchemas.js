const { z } = require("zod");

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "אימייל וסיסמה נדרשים" })
      .trim()
      .email("אימייל לא תקין")
      .toLowerCase(),
    password: z.string({ required_error: "אימייל וסיסמה נדרשים" }).min(1, "אימייל וסיסמה נדרשים")
  })
});

const signupSchema = z.object({
  body: z.object({
    userCode: z.string().trim().min(1, "קוד משתמש נדרש"),
    firstName: z.string().trim().min(1, "יש למלא שם פרטי ושם משפחה."),
    lastName: z.string().trim().min(1, "יש למלא שם פרטי ושם משפחה."),
    email: z.string().trim().email("אימייל לא תקין").toLowerCase(),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        "הסיסמה חייבת להכיל לפחות 8 תווים, אות קטנה, אות גדולה ומספר."
      ),
    img: z.string().optional(),
    userStatus: z.boolean().optional()
  })
});

module.exports = { loginSchema, signupSchema };
