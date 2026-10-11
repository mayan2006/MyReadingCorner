const { request, app, signupUser, loginUser, createManager, cookieHeader } = require("./helpers");

describe("Subject approval", () => {
  it("forbids a regular user from approving a subject and allows a manager", async () => {
    const userRes = await signupUser({
      userCode: "SUB-USER",
      email: "sub-user@test.com"
    });
    const userCookies = cookieHeader(userRes);

    const requestSubject = await request(app)
      .post("/subject/user-request")
      .set("Cookie", userCookies)
      .send({ name: "נושא לבדיקה" });

    expect(requestSubject.status).toBe(200);
    const subjectCode = requestSubject.body.Subject.subjectCode;
    expect(requestSubject.body.Subject.managerApproved).toBe(false);

    const userApprove = await request(app)
      .patch(`/subject/${subjectCode}/approve`)
      .set("Cookie", userCookies)
      .send({ categoryCode: "פנטזיה" });

    expect(userApprove.status).toBe(403);
    expect(userApprove.body.message).toBe("אין הרשאה לבצע פעולה זו");

    const manager = await createManager();
    const managerLogin = await loginUser(manager.email);
    expect(managerLogin.status).toBe(200);

    const managerApprove = await request(app)
      .patch(`/subject/${subjectCode}/approve`)
      .set("Cookie", cookieHeader(managerLogin))
      .send({ categoryCode: "פנטזיה" });

    expect(managerApprove.status).toBe(200);
    expect(managerApprove.body.Subject.managerApproved).toBe(true);
  });
});
