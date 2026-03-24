# 🏋️‍♂️ EvolutFit API - Backend Core (v1)

**EvolutFit** es una API RESTful de alto rendimiento diseñada para la gestión integral de entrenamientos. Permite a los atletas registrar sesiones, calcular su **1RM** con precisión científica, monitorizar métricas de salud y compartir su progreso en una comunidad social dinámica.

---

## 🚀 Tecnologías y Herramientas

- **Node.js & Express:** Servidor robusto y escalable.
- **MongoDB & Mongoose:** Base de datos NoSQL con modelado de datos jerárquico.
- **JWT (JSON Web Tokens):** Autenticación segura y persistente (30 días de sesión).
- **Bcrypt:** Encriptación avanzada para la seguridad de credenciales.
- **CORS:** Configurado para la integración fluida con el Frontend (Vite/React).

---

## 📂 Arquitectura del Proyecto (MVC)

El proyecto está organizado siguiendo el patrón **Modelo-Vista-Controlador** para separar la lógica de negocio del enrutamiento:

- `src/api/models/`: Esquemas de Mongoose (User, Workout, Social, RM, Health).
- `src/api/controllers/`: Funciones de lógica de negocio y gestión de respuestas.
- `src/api/routes/`: Definición de endpoints semánticos versionados en `/v1`.
- `src/middlewares/`: Capa de seguridad y validación (`isAuth`).
- `src/utils/`: Utilidades de cifrado (JWT) y herramientas auxiliares.

---

## 🛠️ Endpoints de la API (v1)

### 🔐 Autenticación y Usuarios (`/api/v1/auth` & `/api/v1/user`)

- `POST /auth/register` - Registro de nuevos atletas.
- `POST /auth/login` - Inicio de sesión y entrega de Token JWT.
- `GET /user` - Lista de todos los usuarios registrados (Público).
- `GET /user/:id` - Detalle de un perfil específico.
- `PUT /user/:id/change-password` - Actualización de contraseña (Privado).
- `PUT /user/:id` - Actualización de datos de perfil (Privado).
- `DELETE /user/:id` - Eliminación permanente de cuenta (Privado).

### 📊 Entrenamientos y Analítica (`/api/v1/workout`)

- `POST /` - Registrar una nueva sesión completada.
- `GET /my-workouts` - Historial personal de entrenamientos.
- `GET /stats` - Estadísticas de distribución muscular y volumen.
- `GET /total-volume` - Sumatoria total de peso levantado (Tonnage).
- `GET /:id` - Detalle de una rutina específica.
- `DELETE /:id` - Eliminar registro de entrenamiento.

### 🏆 Fuerza y Leaderboard (`/api/v1/rm`)

- `POST /` - Registrar nueva marca personal (1RM).
- `GET /` - Historial de RMs del usuario.
- `GET /leaderboard` - Ranking global de los mejores levantamientos.
- `DELETE /:id` - Eliminar marca de RM.

### 🍎 Salud y Biometría (`/api/v1/health`)

- `POST /` - Guardar cálculo de salud (IMC, TDEE, TMB).
- `GET /` - Historial biométrico del usuario.
- `DELETE /:id` - Eliminar registro de salud.

### 🤝 Comunidad Social (`/api/v1/social`)

- `GET /` - Feed de publicaciones (Soporta query params: `sort`, `muscle`, `search`).
- `POST /` - Compartir una nueva rutina con la comunidad.
- `POST /:id/like` - Alternar (Toggle) Like en una publicación.

---

## 🛡️ Características de Seguridad

1.  **Protección de Rutas:** Uso sistemático del middleware `isAuth` para validar el Token JWT en el Header `Authorization`.
2.  **Inyección de Identidad:** El servidor vincula automáticamente el `req.user` mediante el token, garantizando que un usuario solo pueda modificar sus propios datos.
3.  **CORS:** Configurado para aceptar peticiones multiplataforma.
4.  **Versionado:** API estructurada bajo `/v1` para asegurar la compatibilidad futura.

---

## 🧪 Tests

La suite de tests cubre los 6 módulos de la API con **55 tests** usando Jest + Supertest + MongoDB In-Memory.

### Ejecutar tests

```bash
# Todos los tests con reporte de coverage
npm test

# Modo watch (re-ejecuta al guardar)
npm run test:watch
```

### Resultados actuales

| Suite | Tests | Estado |
|-------|-------|--------|
| auth.test.js | 6 | ✅ |
| user.test.js | 9 | ✅ |
| workout.test.js | 10 | ✅ |
| health.test.js | 7 | ✅ |
| rm.test.js | 8 | ✅ |
| social.test.js | 15 | ✅ |
| **Total** | **55** | **✅ 100%** |

**Coverage global: 83.67% líneas** (umbral mínimo: 80%)

### Arquitectura de tests

- `tests/helpers/db.js` — Levanta MongoDB en memoria con `mongodb-memory-server`
- `tests/helpers/auth.js` — Helper para crear usuarios y tokens JWT de prueba
- Cada suite usa `beforeAll/afterEach/afterAll` para aislar datos entre tests
- El mailer (Nodemailer) se mockea para no enviar emails reales

---

## ⚙️ Configuración Local

1.  Clona el repositorio e instala dependencias: `npm install`.
2.  Crea un archivo `.env` con: `MONGO_URI`, `JWT_SECRET` y `PORT`.
3.  Ejecuta en desarrollo: `npm run dev`.

---

## 🖥️ Cliente / Frontend

Este backend provee la API y servicios para la aplicación cliente (Frontend) de **EvolutFit**, la cual se encuentra desplegada en **Vercel**.

- **Sitio Web (Demo):** [https://evolufit-frontend.vercel.app/](https://evolufit-frontend.vercel.app/)
- **Repositorio Frontend:** [github.com/DeibyGS/evolufit-frontend](https://github.com/DeibyGS/evolufit-frontend)
