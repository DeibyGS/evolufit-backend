/**
 * SOCIAL TESTS - EVOLUTFIT
 * Cubre: GET /api/social · POST /api/social
 *        PUT /api/social/:id · DELETE /api/social/:id
 *        PATCH /api/social/:id/like
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

// Payload válido según createPostSchema
// muscleGroups debe usar valores de MUSCLE_GROUPS · title min 5 chars · content min 10 chars
const postPayload = {
  title: "Mi rutina de pecho",
  content: "Press banca 5x5 con 80kg, muy efectivo para ganar fuerza.",
  muscleGroups: ["Pecho", "Tríceps"],
};

describe("POST /api/social", () => {
  it("should create a post and return 201", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("title", postPayload.title);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/social").send(postPayload);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/social", () => {
  it("should return paginated posts", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const res = await request(app)
      .get("/api/social")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBe(1);
  });

  it("should filter posts by muscle group", async () => {
    const { token } = await createTestUserAndToken();
    await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const res = await request(app)
      .get("/api/social?muscle=Pecho")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBe(1);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/social");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/social/:id", () => {
  it("should update a post when the author requests it", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const postId = createRes.body._id;
    const res = await request(app)
      .put(`/api/social/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Título actualizado correctamente",
        content: "Nuevo contenido más detallado para el test.",
        muscleGroups: ["Pecho"],
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Título actualizado correctamente");
  });

  it("should return 404 when another user tries to edit", async () => {
    const { token: authorToken } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${authorToken}`)
      .send(postPayload);

    const postId = createRes.body._id;
    const { token: otherToken } = await createTestUserAndToken({
      email: "otro@evolufit.com",
    });

    const res = await request(app)
      .put(`/api/social/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        title: "Intento de hack al título",
        content: "Contenido no autorizado para este post.",
        muscleGroups: ["Espalda"],
      });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/social/:id", () => {
  it("should delete a post when the author requests it", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const postId = createRes.body._id;
    const res = await request(app)
      .delete(`/api/social/${postId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });

  it("should return 404 when another user tries to delete", async () => {
    const { token: authorToken } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${authorToken}`)
      .send(postPayload);

    const postId = createRes.body._id;
    const { token: otherToken } = await createTestUserAndToken({
      email: "otro@evolufit.com",
    });

    const res = await request(app)
      .delete(`/api/social/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/social/:id/like", () => {
  it("should add a like to a post", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const postId = createRes.body._id;
    const res = await request(app)
      .patch(`/api/social/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("likes");
    expect(res.body).toHaveProperty("isLiked", true);
  });

  it("should remove the like when toggled again", async () => {
    const { token } = await createTestUserAndToken();
    const createRes = await request(app)
      .post("/api/social")
      .set("Authorization", `Bearer ${token}`)
      .send(postPayload);

    const postId = createRes.body._id;
    // Like
    await request(app)
      .patch(`/api/social/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);
    // Unlike
    const res = await request(app)
      .patch(`/api/social/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.isLiked).toBe(false);
    expect(res.body.likes).toBe(0);
  });
});
