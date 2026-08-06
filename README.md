<div align="center">

# 🏋️‍♂️ EvoluFit API

**The backend core powering EvolutFit.**

A high-performance REST APIs designed for comprehensive workout management — log sessions, calculate your **1RM** with scientific precision, monitor health metrics, and share progress in a dynamic social community.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Technologies & Tools](#technologies--tools) • [Architecture (MVC)](#project-architecture-mvc) • [API Endpoints](#api-endpoints) • [Security](#security-features) • [Tests](#tests) • [AI Development](#ai-development-benchmark) • [Built with AI](#built-with-ai) • [Local Setup](#local-setup) • [Frontend](#client--frontend)

</div>

---

## 🚀 Technologies & Tools

- **Node.js & Express:** Robust, scalable server.
- **MongoDB & Mongoose:** NoSQL database with hierarchical data modeling.
- **JWT (JSON Web Tokens):** Secure, persistent authentication (30-day sessions).
- **Bcrypt:** Advanced encryption for credential security.
- **CORS:** Configured for seamless integration with the Frontend (Vite/React).

---

## 📂 Project Architecture (MVC)

The project follows the **Model-View-Controller** pattern to separate business logic from routing:

- `src/api/models/`: Mongoose schemas (User, Workout, Social, RM, Health).
- `src/api/controllers/`: Business logic functions and response management.
- `src/api/routes/`: Semantic endpoint definitions.
- `src/middlewares/`: Security and validation layer (`isAuth`).
- `src/utils/`: Encryption utilities (JWT) and helper tools.

---

## 🛠️ API Endpoints

> **Note:** Routes are mounted without `/v1` versioning (see `app.js`). Authentication via `Authorization: Bearer <token>`.

### 🔐 Authentication (`/api/auth`)

- `POST /register` - Register new athletes. (Public)
- `POST /login` - Log in and get a JWT. (Public)
- `POST /forgot-password` - Request a recovery link by email. (Public)
- `POST /reset-password/:token` - Set a new password using the URL token. (Public)
- `PATCH /change-password` - Change password validating the current one. (Private `isAuth`)

### 👤 Users (`/api/users`)

- `GET /` - List all users (Ranking). (Private `isAuth`)
- `GET /:id` - View a specific profile detail. (Private `isAuth`)
- `PUT /profile` - Update general profile data. (Private)
- `DELETE /delete-me` - Permanently delete your own account. (Private)

### 📊 Workouts & Analytics (`/api/workouts`)

- `POST /` - Log a completed workout session.
- `GET /my-workouts` - Personal workout history (supports `page`/`limit`).
- `GET /stats` - Muscle distribution and volume statistics.
- `GET /total-volume` - Total weight lifted (Tonnage).
- `GET /:id` - Detailed breakdown of a specific routine.
- `DELETE /:id` - Delete a workout record.

### 🏆 Strength & Leaderboard (`/api/rm`)

- `POST /` - Register a new personal record (1RM).
- `GET /` - User's RM history.
- `GET /leaderboard` - Global ranking of best lifts (paginated).
- `DELETE /:id` - Delete an RM record.

### 🍎 Health & Biometrics (`/api/health`)

- `POST /` - Save a health calculation (BMI, TDEE, BMR).
- `GET /` - User's biometric history.
- `DELETE /:id` - Delete a health record.

### 🤝 Social Community (`/api/social`)

- `GET /` - Post feed (supports query params: `sort`, `muscle`, `search`).
- `POST /` - Share a routine with the community.
- `PATCH /:id/like` - Toggle like on a post.
- `PUT /:id` - Edit your own post.
- `DELETE /:id` - Delete your own post.

---

## 🛡️ Security Features

1.  **Route Protection:** Systematic use of the `isAuth` middleware to validate the JWT in the `Authorization` header.
2.  **Identity Injection:** The server links `req.user` via the token, ensuring a user can only modify their own data.
3.  **CORS:** Configured to accept cross-platform requests.
4.  **Versioning:** API structured for future compatibility.

---

## 🧪 Tests

The test suite covers the 6 API modules with **55 tests** using Jest + Supertest + In-Memory MongoDB.

### Running tests

```bash
# All tests with coverage report
npm test

# Watch mode (re-runs on save)
npm run test:watch
```

### Current results

| Suite | Tests | Status |
|-------|-------|--------|
| auth.test.js | 6 | ✅ |
| user.test.js | 9 | ✅ |
| workout.test.js | 10 | ✅ |
| health.test.js | 7 | ✅ |
| rm.test.js | 8 | ✅ |
| social.test.js | 15 | ✅ |
| **Total** | **55** | **✅ 100%** |

**Global coverage: 83.67% lines** (minimum threshold: 80%)

### Test architecture

- The mailer (Nodemailer) is mocked to avoid sending real emails
- Each suite uses `beforeAll/afterEach/afterAll` to isolate data between tests

---

## AI Development Benchmark

EvoluFit Backend was engineered by a human developer working with AI as a **pair programming partner**. The AI accelerated implementation — the Express architecture, MVC structure, and engineering decisions stayed human.

### How we worked together

| Human-owned | AI implemented, always human-reviewed |
|-------------|-------------------------------------|
| Product vision & API design | Express route & controller generation |
| MVC architecture & data model (MongoDB) | Mongoose schemas, service layer |
| Security & validation decisions | Refactoring, error handling |
| Code review & final acceptance | Test scaffolding, auxiliary docs |

**Workflow:** `Idea → Spec → AI implementation → Human review → Test → Refine → Merge`

### AI Development Principles

- AI never made product decisions.
- Every implementation started from a written specification.
- Documentation was treated as executable context for AI.
- All generated code required human review.
- Architecture was preserved over implementation speed.

<details>
<summary><strong>Supporting metrics</strong></summary>
<br>

| Metric | Value |
|--------|-------|
| AI sessions | 4 logged (CC) |
| Measured development time | ~25 h |
| Primary model | Claude Sonnet 4.6 |
| Secondary | OpenCode (DeepSeek V4 Flash) |

_Measured with [ClaudeStat](https://github.com/DeibyGS/claudestat). Approximate values; part of the EvolutFit ecosystem._

</details>

---

## ⚙️ Local Setup

1.  Clone the repository and install dependencies: `npm install`.
2.  Create a `.env` file with: `MONGO_URI`, `JWT_SECRET`, and `PORT`.
3.  Run in development: `npm run dev`.

---

## 🖥️ Client / Frontend

This backend provides the API and services for the **EvolutFit** client apps. Both are deployed:

- **Mobile App (React Native + Expo):** [github.com/DeibyGS/evolufit-mobile](https://github.com/DeibyGS/evolufit-mobile)
- **Web App (Demo):** [evolufit-frontend.vercel.app](https://evolufit-frontend.vercel.app/) · [repository](https://github.com/DeibyGS/evolufit-frontend)

---

## 🤖 Built with AI

EvoluFit Backend was built through close human–AI collaboration. AI was used as an interactive pair-programming partner to accelerate delivery while keeping all engineering and product decisions human.

### Who did what

| Human | AI-assisted |
|-------|-------------|
| Product vision, API design, security decisions | Code scaffolding, route & controller generation |
| Architecture (MVC) and final acceptance | Mongoose schemas, refactoring, test scaffolding |
| Bug triage and release decisions | Documentation, error handling, auxiliary helpers |
| Every merge and code review | Code generated only from a written spec |

### How we work

**Workflow:** `Idea → Spec → AI implementation → Human review → Test → Refine → Merge`

No AI workload metric, session count, or management estimate is stated here. AI usage was a means, not a measure — quality and review remain the human's responsibility. For supporting metrics, see the [AI Development Benchmark](#ai-development-benchmark) above.