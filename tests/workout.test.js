/**
 * WORKOUT TESTS - EVOLUTFIT
 * Cubre: POST /api/workouts · GET /api/workouts/my-workouts
 *        GET /api/workouts/stats · GET /api/workouts/total-volume
 *        GET /api/workouts/:id · DELETE /api/workouts/:id
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

// Payload con nombres de ejercicio válidos según exerciseList.js
const workoutPayload = {
  routineName: "Pecho y Tríceps",
  exercises: [
    {
      exerciseName: "Press de Banca Plano con barra",
      muscleGroup: "Pecho",
      sets: [
        { reps: 10, weight: 80 },
        { reps: 8, weight: 85 },
      ],
    },
  ],
};

describe("POST /api/workouts", () => {
  it("should create a workout and return 201", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("routineName", "Pecho y Tríceps");
  });

  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/workouts").send(workoutPayload);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/workouts/my-workouts", () => {
  it("should return paginated workouts for authenticated user", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    const res = await request(app)
      .get("/api/workouts/my-workouts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("workouts");
    expect(Array.isArray(res.body.workouts)).toBe(true);
    expect(res.body.workouts.length).toBe(1);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/workouts/my-workouts");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/workouts/stats", () => {
  it("should return muscle distribution and volume progress", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    const res = await request(app)
      .get("/api/workouts/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("muscleDistribution");
    expect(res.body).toHaveProperty("volumeProgress");
  });
});

describe("GET /api/workouts/total-volume", () => {
  it("should return total volume as 0 with no workouts", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .get("/api/workouts/total-volume")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalWeight", 0);
  });

  it("should calculate correct total volume after adding workouts", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    const res = await request(app)
      .get("/api/workouts/total-volume")
      .set("Authorization", `Bearer ${token}`);

    // 10*80 + 8*85 = 800 + 680 = 1480
    expect(res.status).toBe(200);
    expect(res.body.totalWeight).toBe(1480);
  });
});

describe("GET /api/workouts/:id", () => {
  it("should return a specific workout by id", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    const workoutId = createRes.body._id;
    const res = await request(app)
      .get(`/api/workouts/${workoutId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(workoutId);
  });

  it("should return 404 for non-existent workout", async () => {
    const { token } = await createTestUserAndToken();
    const fakeId = "64a1b2c3d4e5f6a7b8c9d0e1";
    const res = await request(app)
      .get(`/api/workouts/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/workouts/:id", () => {
  it("should delete a workout", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workoutPayload);

    const workoutId = createRes.body._id;
    const res = await request(app)
      .delete(`/api/workouts/${workoutId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminada/i);
  });

  it("should return 404 when deleting non-existent workout", async () => {
    const { token } = await createTestUserAndToken();
    const fakeId = "64a1b2c3d4e5f6a7b8c9d0e1";
    const res = await request(app)
      .delete(`/api/workouts/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
