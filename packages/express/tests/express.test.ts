import { describe, it, expect, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import { taskContracts, userContracts } from "@apibridge/contracts";
import {
  apiBridge,
  errorHandler,
  NotFoundError,
  UnauthorizedError,
  generateOpenApiDocument,
} from "../src";

describe("@apibridge/express", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // 1. Valid / Invalid Query endpoint: GET /api/tasks
    app.get(
      "/api/tasks",
      apiBridge.route(taskContracts.list, async ({ query }) => {
        return {
          status: 200,
          body: {
            items: [
              {
                id: "task-1",
                title: "Test Task",
                description: "Description",
                status: "todo",
                priority: "high",
                assigneeId: null,
                createdAt: "2026-10-16T12:00:00.000Z",
                updatedAt: "2026-10-16T12:00:00.000Z",
              },
            ],
            total: 1,
            page: query.page,
            limit: query.limit,
            totalPages: 1,
          },
        };
      }),
    );

    // 2. Valid / Invalid Body & Unauthorized: POST /api/tasks
    app.post(
      "/api/tasks",
      apiBridge.route(taskContracts.create, async ({ body, req }) => {
        const auth = req.headers["x-demo-user-id"];
        if (!auth) {
          throw new UnauthorizedError("Authentication required to create tasks");
        }

        return {
          status: 201,
          body: {
            id: "task-created",
            title: body.title,
            description: body.description ?? "",
            status: body.status ?? "todo",
            priority: body.priority ?? "medium",
            assigneeId: body.assigneeId ?? null,
            createdAt: "2026-10-16T12:00:00.000Z",
            updatedAt: "2026-10-16T12:00:00.000Z",
          },
        };
      }),
    );

    // 3. Not Found: GET /api/tasks/:id
    app.get(
      "/api/tasks/:id",
      apiBridge.route(taskContracts.get, async ({ params }) => {
        if (params.id === "missing") {
          throw new NotFoundError(`Task with id ${params.id} not found`, "Task");
        }
        return {
          status: 200,
          body: {
            id: params.id,
            title: "Existing Task",
            description: "",
            status: "done",
            priority: "low",
            assigneeId: null,
            createdAt: "2026-10-16T12:00:00.000Z",
            updatedAt: "2026-10-16T12:00:00.000Z",
          },
        };
      }),
    );

    // 4. Invalid Response Detected in Development: GET /api/me
    app.get(
      "/api/me",
      apiBridge.route(
        userContracts.me,
        async () => {
          // Returning invalid payload missing required fields (name, email, role)
          return {
            status: 200,
            body: { id: "user-1" },
          };
        },
        { validateResponse: true },
      ),
    );

    app.use(errorHandler());
  });

  it("handles valid request with correct status and body", async () => {
    const res = await request(app).post("/api/tasks").set("x-demo-user-id", "user-1").send({
      title: "Deploy ApiBridge",
      priority: "high",
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Deploy ApiBridge");
    expect(res.body.priority).toBe("high");
    expect(res.body.id).toBe("task-created");
  });

  it("catches invalid body and returns 400 VALIDATION_ERROR with structured issues", async () => {
    const res = await request(app).post("/api/tasks").set("x-demo-user-id", "user-1").send({
      title: "", // empty title violates min(1)
      priority: "ultra-high", // invalid enum
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
    expect(res.body.issues).toBeDefined();
    expect(res.body.issues.length).toBeGreaterThan(0);
    expect(res.body.issues[0].path[0]).toBe("body");
  });

  it("catches invalid query parameter and returns 400 VALIDATION_ERROR", async () => {
    const res = await request(app).get("/api/tasks?status=unknown_status");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
    expect(res.body.issues[0].path).toContain("query");
    expect(res.body.issues[0].path).toContain("status");
  });

  it("detects invalid response payload during development and returns 500", async () => {
    const res = await request(app).get("/api/me");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("INTERNAL_SERVER_ERROR");
    expect(res.body.message).toContain("Response schema validation failed");
  });

  it("handles not found response with 404 NOT_FOUND", async () => {
    const res = await request(app).get("/api/tasks/missing");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT_FOUND");
    expect(res.body.resource).toBe("Task");
  });

  it("handles unauthorized response with 401 UNAUTHORIZED", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "Without auth header" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  it("generates a valid OpenAPI 3.0 document from contracts", () => {
    const spec = generateOpenApiDocument(
      [taskContracts.list, taskContracts.create, taskContracts.get, userContracts.me],
      {
        info: {
          title: "Test Task API",
          version: "1.0.0",
          description: "Contract-driven test documentation",
        },
      },
    );

    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths["/api/tasks"]).toBeDefined();
    expect(spec.paths["/api/tasks"].get).toBeDefined();
    expect(spec.paths["/api/tasks"].post).toBeDefined();
    expect(spec.paths["/api/tasks/{id}"]).toBeDefined();
    expect(spec.paths["/api/me"]).toBeDefined();
  });
});
