const User = require("../Models/UserModel");
const Category = require("../Models/CategoryModel");
const Subject = require("../Models/SubjectModel");
const Book = require("../Models/BookModel");

const DEMO_PASSWORD = "DemoPass1";
const PLACEHOLDER = "https://placehold.co/400x600?text=Book";

const CATEGORIES = [
  { categoryCode: "CAT-FANTASY", name: "פנטזיה" },
  { categoryCode: "CAT-ROMANCE", name: "רומנטיקה" },
  { categoryCode: "CAT-THRILLER", name: "מתח" },
  { categoryCode: "CAT-YA", name: "נוער" },
  { categoryCode: "CAT-USER", name: "ספרי משתמשים" }
];

const USERS = [
  {
    userCode: "USR-DEMO",
    firstName: "דנה",
    lastName: "קוראת",
    email: "demo@myreadingcorner.local",
    password: DEMO_PASSWORD,
    userStatus: true,
    role: "user",
    img: ""
  },
  {
    userCode: "USR-MANAGER",
    firstName: "מיכל",
    lastName: "מנהלת",
    email: "manager@myreadingcorner.local",
    password: "Manager1Pass",
    userStatus: true,
    role: "manager",
    img: ""
  }
];

const SUBJECTS = [
  {
    subjectCode: "SUB-DEMO-DRAGONS",
    name: "דרקונים",
    img: PLACEHOLDER,
    isApproved: true,
    managerApproved: true,
    categoryCode: "CAT-FANTASY"
  }
];

const BOOKS = [
  {
    bookCode: "DEMO-BOOK-1",
    categoryCode: "CAT-FANTASY",
    title: "הדרקון של הספרייה",
    author: "דנה קוראת",
    summary: "ספר דemo קצר — ילדה מוצאת דרקון בין המדפים ולומדת לקרוא איתו.",
    img: PLACEHOLDER,
    content: "פעם במדף העליון ישב דרקון קטן שאהב סיפורים. הוא לא אכל נסיכות — הוא אכל מילים, מילה אחרי מילה, עד שהספר נגמר בחיוך."
  },
  {
    bookCode: "DEMO-BOOK-2",
    categoryCode: "CAT-THRILLER",
    title: "הצל מאחורי הכריכה",
    author: "מיכל מנהלת",
    summary: "מתח קצר לדוגמה: מישהו משאיר פתקים בתוך הספרים המושאלים.",
    img: PLACEHOLDER,
    content: "בבוקר מצאה הספרנית פתק בין דפי הספר: «אל תסגרי את הספרייה הלילה.» היא הסתובבה — והמדף היה ריק."
  }
];

async function upsertBy(Model, filter, data) {
  const existing = await Model.findOne(filter);
  if (existing) {
    existing.set(data);
    await existing.save();
    return "updated";
  }
  await Model.create(data);
  return "created";
}

/** Idempotent demo data. Does not delete existing non-demo records. */
async function seedDatabase() {
  const counts = { users: 0, categories: 0, subjects: 0, books: 0 };

  for (const cat of CATEGORIES) {
    await upsertBy(Category, { categoryCode: cat.categoryCode }, cat);
    counts.categories += 1;
  }

  for (const user of USERS) {
    const existing = await User.findOne({ userCode: user.userCode });
    if (existing) {
      existing.firstName = user.firstName;
      existing.lastName = user.lastName;
      existing.email = user.email;
      existing.role = user.role;
      existing.userStatus = user.userStatus;
      if (!existing.password) existing.password = user.password;
      await existing.save();
    } else {
      await User.create(user);
    }
    counts.users += 1;
  }

  for (const subject of SUBJECTS) {
    await upsertBy(Subject, { subjectCode: subject.subjectCode }, subject);
    counts.subjects += 1;
  }

  for (const book of BOOKS) {
    await upsertBy(Book, { bookCode: book.bookCode }, book);
    counts.books += 1;
  }

  return {
    ...counts,
    login: {
      user: { email: "demo@myreadingcorner.local", password: DEMO_PASSWORD },
      manager: { email: "manager@myreadingcorner.local", password: "Manager1Pass" }
    }
  };
}

module.exports = { seedDatabase, DEMO_PASSWORD };
