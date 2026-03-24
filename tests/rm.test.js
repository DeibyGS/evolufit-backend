/**
 * RM (1RM) TESTS - EVOLUTFIT
 * Cubre: POST /api/rm · GET /api/rm (my records)
 *        DELETE /api/rm/:id · GET /api/rm/leaderboard
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

// Payload válido según rmValidatorSchema
// weightUsed: min 20 · repsDone: 1-15 · exerciseName debe estar en EXERCISE_NAMES
const rmPayload = {
  exerciseName: "Press de Banca Plano con barra",
  muscleGroup: "Pecho",
  weightUsed: 100,
  repsDone: 5,
  brzyckiResult: 113,
  epleyResult: 116,
};

describe("POST /api/rm", () => {
  it("should save a RM record and return 201", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send(rmPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("exerciseName", rmPayload.exerciseName);
    expect(res.body).toHaveProperty("isNewRecord", true); // primer registro siempre es récord
  });

  it("should detect when a new result is NOT a personal record", async () => {
    const { token } = await createTestUserAndToken();
    // Guardar un récord alto primero
    await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...rmPayload, brzyckiResult: 150 });

    // Guardar uno más bajo — no debería ser récord
    const res = await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...rmPayload, brzyckiResult: 100 });

    expect(res.status).toBe(201);
    expect(res.body.isNewRecord).toBe(false);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/rm").send(rmPayload);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/rm (my records)", () => {
  it("should return paginated RM records for the user", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send(rmPayload);

    const res = await request(app)
      .get("/api/rm")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("records");
    expect(res.body.records.length).toBe(1);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/rm");
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/rm/:id", () => {
  it("should delete a RM record and return 200", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send(rmPayload);

    const recordId = createRes.body._id;
    const res = await request(app)
      .delete(`/api/rm/${recordId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).delete("/api/rm/64a1b2c3d4e5f6a7b8c9d0e1");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/rm/leaderboard", () => {
  it("should return paginated leaderboard", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/rm")
      .set("Authorization", `Bearer ${token}`)
      .send(rmPayload);

    const res = await request(app)
      .get("/api/rm/leaderboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("records");
    expect(Array.isArray(res.body.records)).toBe(true);
  });
});
