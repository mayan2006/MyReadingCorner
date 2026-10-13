const { request, app, signupUser, loginUser, cookieHeader } = require("./helpers");

describe("Auth", () => {
  it("sets an accessToken cookie on signup", async () => {
    const res = await signupUser({
      userCode: "U-AUTH-1",
      email: "auth1@test.com"
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      userCode: "U-AUTH-1",
      email: "auth1@test.com",
      role: "user"
    });
    expect(res.body.user.password).toBeUndefined();

    const cookies = cookieHeader(res);
    expect(cookies).toEqual(
      expect.arrayContaining([expect.stringMatching(/accessToken=/)])
    );
  });

  it("sets an accessToken cookie on login", async () => {
    await signupUser({
      userCode: "U-AUTH-2",
      email: "auth2@test.com"
    });

    const res = await loginUser("auth2@test.com");

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("auth2@test.com");
    expect(cookieHeader(res)).toEqual(
      expect.arrayContaining([expect.stringMatching(/accessToken=/)])
    );
  });

  it("rejects login with the wrong password", async () => {
    await signupUser({
      userCode: "U-AUTH-3",
      email: "auth3@test.com"
    });

    const res = await loginUser("auth3@test.com", "WrongPass1");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("אימייל או סיסמה שגויים");
  });

  it("rejects /user/me without an auth cookie", async () => {
    const res = await request(app).get("/user/me");
    expect(res.status).toBe(401);
  });

  it("rejects a second signup with the same email", async () => {
    await signupUser({
      userCode: "U-AUTH-DUP-1",
      email: "dup@test.com"
    });

    const res = await signupUser({
      userCode: "U-AUTH-DUP-2",
      email: "dup@test.com"
    });

    expect(res.status).toBe(409);
  });

  it("returns the current user when an accessToken cookie is present", async () => {
    const signup = await signupUser({
      userCode: "U-AUTH-4",
      email: "auth4@test.com"
    });

    const res = await request(app)
      .get("/user/me")
      .set("Cookie", cookieHeader(signup));

    expect(res.status).toBe(200);
    expect(res.body.user.userCode).toBe("U-AUTH-4");
  });

  it("returns an accessToken in the login body and accepts a Bearer header", async () => {
    await signupUser({
      userCode: "U-AUTH-5",
      email: "auth5@test.com"
    });

    const login = await loginUser("auth5@test.com");
    expect(login.status).toBe(200);
    expect(typeof login.body.accessToken).toBe("string");
    expect(login.body.accessToken.length).toBeGreaterThan(10);

    const res = await request(app)
      .get("/user/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.userCode).toBe("U-AUTH-5");
  });
});
