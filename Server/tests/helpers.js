const request = require("supertest");
const User = require("../Models/UserModel");
const app = require("../app");

const TEST_PASSWORD = "TestPass1";

const signupUser = (overrides = {}) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return request(app)
    .post("/user/")
    .send({
      userCode: `U${suffix}`,
      firstName: "טסט",
      lastName: "משתמש",
      email: `user${suffix}@test.com`,
      password: TEST_PASSWORD,
      userStatus: true,
      ...overrides
    });
};

const loginUser = (email, password = TEST_PASSWORD) =>
  request(app).post("/user/login").send({ email, password });

const createManager = async (overrides = {}) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const manager = new User({
    userCode: `M${suffix}`,
    firstName: "מנהל",
    lastName: "בדיקה",
    email: `manager${suffix}@test.com`,
    password: TEST_PASSWORD,
    userStatus: true,
    role: "manager",
    ...overrides
  });
  await manager.save();
  return manager;
};

const cookieHeader = (response) => response.headers["set-cookie"];

module.exports = {
  app,
  request,
  TEST_PASSWORD,
  signupUser,
  loginUser,
  createManager,
  cookieHeader
};
