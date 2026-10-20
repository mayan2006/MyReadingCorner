const { seedDatabase, DEMO_PASSWORD } = require("../scripts/seedData");
const User = require("../Models/UserModel");
const Book = require("../Models/BookModel");
const bcrypt = require("bcrypt");

describe("seed", () => {
  it("creates demo users and books, and is safe to run twice", async () => {
    const first = await seedDatabase();
    expect(first.users).toBe(2);
    expect(first.books).toBe(2);

    const second = await seedDatabase();
    expect(second.books).toBe(2);
    expect(await Book.countDocuments({ bookCode: /^DEMO-/ })).toBe(2);

    const demo = await User.findOne({ email: "demo@myreadingcorner.local" });
    expect(demo).toBeTruthy();
    expect(await bcrypt.compare(DEMO_PASSWORD, demo.password)).toBe(true);
  });
});
