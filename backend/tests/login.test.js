jest.mock("../model/userModel", () => ({
  findUserByEmail: jest.fn(),
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const request = require("supertest");
const app = require("../server");
const { findUserByEmail } = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("POST /api/users/login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 200 and a token on correct credentials", async () => {
    findUserByEmail.mockResolvedValue({
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: "hashed",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("fake-jwt-token");
    expect(res.body.user.password).toBeUndefined();
  });

  test("returns 401 when password is incorrect", async () => {
    findUserByEmail.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      password: "hashed",
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Incorrect password");
  });
});
