const Book = require("../Models/BookModel");
const Rating = require("../Models/RatingModel");
const { request, app, signupUser, cookieHeader } = require("./helpers");

const sampleBook = (overrides = {}) => ({
  bookCode: "BOOK-SEARCH-1",
  categoryCode: "פנטזיה",
  title: "The Midnight Library",
  summary: "A story about second chances",
  author: "Matt Haig",
  img: "https://placehold.co/200x300",
  content: "Once upon a time",
  ...overrides
});

describe("Books search, popular, and ratings", () => {
  it("returns a paginated search payload when q is provided", async () => {
    await Book.create(sampleBook());
    await Book.create(
      sampleBook({
        bookCode: "BOOK-SEARCH-2",
        title: "Another Title",
        author: "Other Author"
      })
    );

    const res = await request(app).get("/books").query({ q: "Midnight", limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "The Midnight Library" })])
    );
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it("keeps GET /books without query params as a plain array", async () => {
    await Book.create(sampleBook());
    const res = await request(app).get("/books");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("ranks popular books by like count using aggregation", async () => {
    await Book.create(sampleBook({ bookCode: "POP-A", title: "Quiet Book" }));
    await Book.create(sampleBook({ bookCode: "POP-B", title: "Loved Book" }));

    const userA = await signupUser({ userCode: "POP-USER-A", email: "popa@test.com" });
    const userB = await signupUser({ userCode: "POP-USER-B", email: "popb@test.com" });

    await request(app)
      .post("/bookLike/toggle")
      .set("Cookie", cookieHeader(userA))
      .send({ bookCode: "POP-B" });
    await request(app)
      .post("/bookLike/toggle")
      .set("Cookie", cookieHeader(userB))
      .send({ bookCode: "POP-B" });

    const res = await request(app).get("/books/popular");

    expect(res.status).toBe(200);
    expect(res.body[0].bookCode).toBe("POP-B");
    expect(res.body[0].likeCount).toBe(2);
  });

  it("returns a rating summary from an aggregation", async () => {
    await Book.create(sampleBook({ bookCode: "RATE-1" }));
    await Rating.create([
      { bookCode: "RATE-1", userCode: "R1", stars: 5 },
      { bookCode: "RATE-1", userCode: "R2", stars: 3 }
    ]);

    const res = await request(app).get("/rating/summary/RATE-1");

    expect(res.status).toBe(200);
    expect(res.body.average).toBe(4);
    expect(res.body.total).toBe(2);
  });
});
