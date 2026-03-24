/**
 * USER TESTS - EVOLUTFIT
 * Cubre: GET /api/users · GET /api/users/:id
 *        PUT /api/users/profile · PATCH /api/users/change-password
 *        DELETE /api/users/delete-me
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

describe("GET /api/users", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("should return list of users with valid token", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/users/:id", () => {
  it("should return user by id", async () => {
    const { user, token } = await createTestUserAndToken();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(user._id.toString());
  });

  it("should return 404 for non-existent user id", async () => {
    const { token } = await createTestUserAndToken();
    const fakeId = "64a1b2c3d4e5f6a7b8c9d0e1";
    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/users/profile", () => {
  it("should update user profile successfully", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "NuevoNombre" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("NuevoNombre");
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .send({ name: "NuevoNombre" });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/users/change-password", () => {
  it("should change password with correct old password", async () => {
    const { token } = await createTestUserAndToken({ password: "password123" });
    const res = await request(app)
      .patch("/api/users/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ oldPassword: "password123", password: "newpassword456" });

    expect(res.status).toBe(200);
  });

  it("should return 401 with wrong old password", async () => {
    const { token } = await createTestUserAndToken({ password: "password123" });
    const res = await request(app)
      .patch("/api/users/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({ oldPassword: "wrongpassword", password: "newpassword456" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/users/delete-me", () => {
  it("should delete user account", async () => {
    const { token } = await createTestUserAndToken();
    const res = await request(app)
      .delete("/api/users/delete-me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should return 401 without token", async () => {
    const res = await request(app).delete("/api/users/delete-me");
    expect(res.status).toBe(401);
  });
});
