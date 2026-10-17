import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userContracts, taskContracts } from "@ahmed109/apibridge-contracts";
import { generateOpenApiDocument, setupSwaggerDocs, errorHandler } from "@ahmed109/apibridge-express";
import { authRouter } from "./routes/auth";
import { taskRouter } from "./routes/tasks";
import { userRepo } from "./data/repository";

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) or matching origin
      if (!origin || origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
      return callback(null, origin === CORS_ORIGIN);
    },
    credentials: true,
  }),
);
app.use(express.json());

// Users endpoint for demo user switcher
app.get("/api/users", (_req, res) => {
  res.json({ users: userRepo.getAll() });
});

// Mount domain routes
app.use(authRouter);
app.use(taskRouter);

// Generate OpenAPI 3.0 specification from shared contracts
const openApiSpec = generateOpenApiDocument(
  [
    userContracts.me,
    taskContracts.list,
    taskContracts.get,
    taskContracts.create,
    taskContracts.update,
    taskContracts.delete,
  ],
  {
    info: {
      title: "ApiBridge Task Management API",
      version: "1.0.0",
      description:
        "Full-stack contract-driven REST API powered by @ahmed109/apibridge-contracts and @ahmed109/apibridge-express.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local development server",
      },
    ],
  },
);

// Mount Swagger UI at /docs
setupSwaggerDocs(app, "/docs", openApiSpec);

// Error Handling Middleware
app.use(errorHandler());

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ApiBridge Demo API running on http://localhost:${PORT}`);
    console.log(`📘 Swagger / OpenAPI Documentation: http://localhost:${PORT}/docs`);
    console.log(`📡 Contract Endpoints Active:`);
    console.log(`   - GET    /api/me`);
    console.log(`   - GET    /api/tasks`);
    console.log(`   - GET    /api/tasks/:id`);
    console.log(`   - POST   /api/tasks`);
    console.log(`   - PATCH  /api/tasks/:id`);
    console.log(`   - DELETE /api/tasks/:id`);
    console.log(`👥 Demo Users:`);
    userRepo.getAll().forEach((u) => {
      console.log(`   - [${u.id}] ${u.name} (${u.email}) [Role: ${u.role}]`);
    });
    console.log(`======================================================\n`);
  });
}

export { app };
