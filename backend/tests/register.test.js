jest.mock("../model/userModel", () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

jest.mock("bcrypt");

const request = require("supertest");
const app = require("../server");
const { createUser, findUserByEmail } = require("../model/userModel");
const bcrypt = require("bcrypt");

describe("POST /api/users/register", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 201 and creates the user", async () => {
    const mockUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: "hashed",
    };
    findUserByEmail.mockResolvedValue(undefined);
    bcrypt.hash.mockResolvedValue("hashed");
    createUser.mockResolvedValue(mockUser);

    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Account created successfully");
    expect(res.body.user.password).toBeUndefined();
  });

  test("returns 409 when email is already registered", async () => {
    findUserByEmail.mockResolvedValue({ id: 1, email: "test@example.com" });

    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Email is already registered");
  });
});
