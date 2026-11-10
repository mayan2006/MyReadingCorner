const Book = require("../Models/BookModel");
const { request, app, signupUser, loginUser, createManager, cookieHeader } = require("./helpers");
const { parseCsv, cleanText, makeSummary } = require("../utils/benYehudaCsv");
const { PENDING_CATEGORY_CODE, PLACEHOLDER_COVER } = require("../utils/catalogVisibility");

const pendingBook = (overrides = {}) => ({
  bookCode: "BY-101",
  categoryCode: PENDING_CATEGORY_CODE,
  title: "ספר ממתין",
  author: "מחבר קלאסי",
  summary: "תקציר של יצירה מיובאת",
  img: PLACEHOLDER_COVER,
  content: "תוכן ארוך של ספר מיובא לבדיקה.",
  source: "benyehuda",
  externalId: "101",
  sourceCredit: "פרויקט בן־יהודה — https://benyehuda.org",
  importedAt: new Date(),
  importStatus: "pending",
  ...overrides
});

describe("Ben Yehuda CSV helpers", () => {
  it("parses quoted CSV fields", () => {
    const rows = parseCsv('ID,title,genre\n1,"שלום, עולם",heb.prose\n');
    expect(rows).toEqual([{ ID: "1", title: "שלום, עולם", genre: "heb.prose" }]);
  });

  it("builds a short summary and strips a duplicate title line", () => {
    const text = cleanText("הכותרת\n\nפסקה ראשונה ארוכה מספיק בשביל תקציר.\n\nעוד פסקה.", "הכותרת");
    expect(text.startsWith("פסקה ראשונה")).toBe(true);
    expect(makeSummary(text)).toContain("פסקה ראשונה");
  });
});

describe("Imported book moderation", () => {
  it("hides pending books from the public catalog and book page", async () => {
    await Book.create(pendingBook());
    await Book.create(
      pendingBook({
        bookCode: "PUB-1",
        title: "ספר גלוי",
        categoryCode: "פנטזיה",
        importStatus: "published",
        externalId: "pub-1"
      })
    );

    const list = await request(app).get("/books");
    expect(list.status).toBe(200);
    const titles = list.body.map((b) => b.title);
    expect(titles).toContain("ספר גלוי");
    expect(titles).not.toContain("ספר ממתין");

    const hidden = await request(app).get("/books/code/BY-101");
    expect(hidden.status).toBe(404);

    const visible = await request(app).get("/books/code/PUB-1");
    expect(visible.status).toBe(200);
    expect(visible.body.title).toBe("ספר גלוי");
  });

  it("lets a manager assign a catalog category or reject an import", async () => {
    await Book.create(pendingBook());
    await Book.create(
      pendingBook({
        bookCode: "BY-102",
        title: "ספר לדחייה",
        externalId: "102"
      })
    );

    const userRes = await signupUser({ userCode: "IMP-USER", email: "imp-user@test.com" });
    const forbidden = await request(app)
      .get("/books/import/pending")
      .set("Cookie", cookieHeader(userRes));
    expect(forbidden.status).toBe(403);

    const manager = await createManager();
    const managerLogin = await loginUser(manager.email);
    const cookies = cookieHeader(managerLogin);

    const pending = await request(app).get("/books/import/pending").set("Cookie", cookies);
    expect(pending.status).toBe(200);
    expect(pending.body).toHaveLength(2);
    expect(pending.body[0].content).toBeUndefined();

    const badCategory = await request(app)
      .post("/books/import/BY-101/approve")
      .set("Cookie", cookies)
      .send({ categoryCode: "ספרי משתמשים" });
    expect(badCategory.status).toBe(400);

    const approved = await request(app)
      .post("/books/import/BY-101/approve")
      .set("Cookie", cookies)
      .send({ categoryCode: "פנטזיה" });
    expect(approved.status).toBe(200);
    expect(approved.body.book.importStatus).toBe("published");
    expect(approved.body.book.categoryCode).toBe("פנטזיה");

    const rejected = await request(app)
      .post("/books/import/BY-102/reject")
      .set("Cookie", cookies);
    expect(rejected.status).toBe(200);

    const catalog = await request(app).get("/books");
    const titles = catalog.body.map((b) => b.title);
    expect(titles).toContain("ספר ממתין");
    expect(titles).not.toContain("ספר לדחייה");
  });
});
