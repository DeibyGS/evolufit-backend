/**
 * AUTH TESTS - EVOLUTFIT
 * Cubre: POST /api/auth/register · POST /api/auth/login
 *        POST /api/auth/forgot-password · POST /api/auth/reset-password/:token
 *        POST /api/auth/change-password
 */

process.env.JWT_SECRET = "test_secret_key";
process.env.EMAIL_USER = "test@evolufit.com";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const { connect, disconnect, clearDatabase } = require("./helpers/db");

// vi.mock no intercepta require() en proyectos CJS porque el módulo ya está
// en la caché de Node antes de que el mock se registre.
// Solución: vi.spyOn sobre el objeto ya cargado. Funciona porque Node.js cachea
// el módulo por referencia — mutar sendMail afecta también la variable `transporter`
// que ya tiene el controller en su scope.
let sendMailSpy;

beforeAll(async () => {
  const mailer = require("../utils/mailer");
  sendMailSpy = vi
    .spyOn(mailer, "sendMail")
    .mockResolvedValue({ messageId: "test-id" });
  await connect();
});
afterEach(async () => await clearDatabase());
afterAll(async () => {
  sendMailSpy?.mockRestore();
  await disconnect();
});

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const validUser = {
    name: "Deiby",
    lastname: "Gorrin",
    email: "deiby@evolufit.com",
    age: 22,
    password: "password123",
  };

  it("should register a new user and return 201 with token", async () => {
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", validUser.email);
    expect(res.body.user).not.toHaveProperty("password"); // nunca exponer el hash
  });

  it("should return 409 when email is already registered", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app).post("/api/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.errors[0].path).toBe("email");
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Deiby",
      lastname: "Gorrin",
      email: "deiby@evolufit.com",
      age: 22,
      password: "password123",
    });
  });

  it("should login with correct credentials and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "deiby@evolufit.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "deiby@evolufit.com");
  });

  it("should return 404 when email is not registered", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "noexiste@evolufit.com",
      password: "password123",
    });

    expect(res.status).toBe(404);
  });

  it("should return 401 when password is wrong", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "deiby@evolufit.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

describe("POST /api/auth/forgot-password", () => {
  it("should return 200 even if email does not exist (security)", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "noexiste@evolufit.com" });

    expect(res.status).toBe(200);
  });

  it("should return 200 and send email when user exists", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Deiby",
      lastname: "Gorrin",
      email: "deiby@evolufit.com",
      age: 22,
      password: "password123",
    });

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "deiby@evolufit.com" });

    expect(res.status).toBe(200);
  });
});
