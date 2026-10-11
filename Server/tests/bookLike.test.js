const { request, app, signupUser, cookieHeader } = require("./helpers");

describe("Book likes", () => {
  it("rejects toggling a like without authentication", async () => {
    const res = await request(app)
      .post("/bookLike/toggle")
      .send({ bookCode: "BOOK-1" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("נדרשת התחברות");
  });

  it("likes as the cookie user even if another userCode is sent in the body", async () => {
    const userA = await signupUser({
      userCode: "LIKE-A",
      email: "like-a@test.com"
    });
    const userB = await signupUser({
      userCode: "LIKE-B",
      email: "like-b@test.com"
    });

    const toggleAsA = await request(app)
      .post("/bookLike/toggle")
      .set("Cookie", cookieHeader(userA))
      .send({ bookCode: "BOOK-SHARED", userCode: "LIKE-B" });

    expect(toggleAsA.status).toBe(200);
    expect(toggleAsA.body.liked).toBe(true);
    expect(toggleAsA.body.count).toBe(1);

    const stateForA = await request(app)
      .get("/bookLike/book/BOOK-SHARED")
      .set("Cookie", cookieHeader(userA));
    expect(stateForA.body.likedByUser).toBe(true);

    const stateForB = await request(app)
      .get("/bookLike/book/BOOK-SHARED")
      .set("Cookie", cookieHeader(userB));
    expect(stateForB.body.likedByUser).toBe(false);
    expect(stateForB.body.count).toBe(1);
  });
});
