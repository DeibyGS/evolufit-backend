/**
 * HEALTH TESTS - EVOLUTFIT
 * Cubre: POST /api/health · GET /api/health · DELETE /api/health/:id
 */

process.env.JWT_SECRET = "test_secret_key";
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const { connect, disconnect, clearDatabase } = require("./helpers/db");
const { createTestUserAndToken } = require("./helpers/auth");

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await disconnect());

// Payload válido según healthValidatorSchema
// gender: "hombre" | "mujer" · activity: número entre 1.2 y 2.5
const healthPayload = {
  weight: 75,
  height: 178,
  age: 25,
  gender: "hombre",
  activity: 1.55,
  imc: 23.67,
  tmb: 1800,
  tdee: 2790,
};

describe("POST /api/health", () => {
  it("should save a health record and return 201", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/health")
      .set("Authorization", `Bearer ${token}`)
      .send(healthPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("imc", healthPayload.imc);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/health").send(healthPayload);
    expect(res.status).toBe(401);
  });

  it("should return 400 with invalid gender", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/health")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...healthPayload, gender: "male" }); // inválido, debe ser "hombre" o "mujer"

    expect(res.status).toBe(400);
  });
});

describe("GET /api/health", () => {
  it("should return empty array when no health records", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .get("/api/health")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should return health records after saving one", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/health")
      .set("Authorization", `Bearer ${token}`)
      .send(healthPayload);

    const res = await request(app)
      .get("/api/health")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty("imc", healthPayload.imc);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/health/:id", () => {
  it("should delete a health record", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/health")
      .set("Authorization", `Bearer ${token}`)
      .send(healthPayload);

    const recordId = createRes.body._id;
    const res = await request(app)
      .delete(`/api/health/${recordId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it("should return 404 when deleting non-existent record", async () => {
    const { token } = await createTestUserAndToken();
    const fakeId = "64a1b2c3d4e5f6a7b8c9d0e1";
    const res = await request(app)
      .delete(`/api/health/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
