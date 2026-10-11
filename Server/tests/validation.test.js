const { request, app } = require("./helpers");

describe("Request validation", () => {
  it("rejects login with empty fields", async () => {
    const res = await request(app).post("/user/login").send({
      email: "",
      password: ""
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it("rejects login with an invalid email", async () => {
    const res = await request(app).post("/user/login").send({
      email: "not-an-email",
      password: "whatever"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("אימייל לא תקין");
  });

  it("rejects a like toggle without bookCode", async () => {
    const signup = await request(app).post("/user/").send({
      userCode: "VAL-1",
      firstName: "וליד",
      lastName: "ציה",
      email: "val1@test.com",
      password: "TestPass1",
      userStatus: true
    });

    const res = await request(app)
      .post("/bookLike/toggle")
      .set("Cookie", signup.headers["set-cookie"])
      .send({});

    expect(res.status).toBe(400);
  });
});
