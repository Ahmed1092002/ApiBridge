import { describe, it, expect } from "vitest";
import {
  TaskSchema,
  TaskQuerySchema,
  CreateTaskInputSchema,
  UpdateTaskInputSchema,
  taskContracts,
  ValidationErrorSchema,
  UnauthorizedErrorSchema,
  NotFoundErrorSchema,
  InternalServerErrorSchema,
  userContracts,
} from "../src";

describe("@apibridge/contracts", () => {
  describe("TaskSchema", () => {
    it("validates a complete, valid task", () => {
      const validTask = {
        id: "task-1",
        title: "Build ApiBridge",
        description: "Type-safe contracts for full-stack TypeScript",
        status: "in_progress",
        priority: "high",
        assigneeId: "user-1",
        createdAt: "2026-10-16T12:00:00.000Z",
        updatedAt: "2026-10-16T12:00:00.000Z",
      };

      const result = TaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Build ApiBridge");
        expect(result.data.priority).toBe("high");
      }
    });

    it("fails validation for invalid status", () => {
      const invalidTask = {
        id: "task-1",
        title: "Invalid Status Task",
        description: "",
        status: "archived", // not allowed
        priority: "medium",
        assigneeId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it("fails validation for empty title", () => {
      const invalidTask = {
        id: "task-1",
        title: "",
        status: "todo",
        priority: "low",
        assigneeId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = TaskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe("TaskQuerySchema", () => {
    it("applies defaults for pagination and sorting", () => {
      const query = {};
      const parsed = TaskQuerySchema.parse(query);
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe("createdAt");
      expect(parsed.sortOrder).toBe("desc");
    });

    it("coerces string query values to numbers", () => {
      const query = { page: "3", limit: "25", status: "todo", priority: "high" };
      const parsed = TaskQuerySchema.parse(query);
      expect(parsed.page).toBe(3);
      expect(parsed.limit).toBe(25);
      expect(parsed.status).toBe("todo");
      expect(parsed.priority).toBe("high");
    });

    it("rejects non-numeric page values", () => {
      const query = { page: "invalid" };
      const result = TaskQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe("CreateTaskInputSchema", () => {
    it("applies default status and priority", () => {
      const input = { title: "Simple Task" };
      const parsed = CreateTaskInputSchema.parse(input);
      expect(parsed.status).toBe("todo");
      expect(parsed.priority).toBe("medium");
      expect(parsed.description).toBe("");
    });

    it("rejects excessively long titles", () => {
      const input = { title: "a".repeat(101) };
      const result = CreateTaskInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateTaskInputSchema", () => {
    it("accepts partial updates", () => {
      const update = { status: "done" as const };
      const result = UpdateTaskInputSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe("Standard Error Schemas", () => {
    it("validates 400 ValidationError shape", () => {
      const err = {
        statusCode: 400 as const,
        error: "VALIDATION_ERROR" as const,
        message: "Invalid request payload",
        issues: [{ path: ["title"], message: "Title is required" }],
      };
      expect(ValidationErrorSchema.safeParse(err).success).toBe(true);
    });

    it("validates 401 UnauthorizedError shape", () => {
      const err = {
        statusCode: 401 as const,
        error: "UNAUTHORIZED" as const,
        message: "Authentication required",
      };
      expect(UnauthorizedErrorSchema.safeParse(err).success).toBe(true);
    });

    it("validates 404 NotFoundError shape", () => {
      const err = {
        statusCode: 404 as const,
        error: "NOT_FOUND" as const,
        message: "Task not found",
        resource: "Task",
      };
      expect(NotFoundErrorSchema.safeParse(err).success).toBe(true);
    });

    it("validates 500 InternalServerError shape", () => {
      const err = {
        statusCode: 500 as const,
        error: "INTERNAL_SERVER_ERROR" as const,
        message: "An unexpected error occurred",
      };
      expect(InternalServerErrorSchema.safeParse(err).success).toBe(true);
    });
  });

  describe("Route Contracts Definitions", () => {
    it("defines tasks endpoints with expected methods and paths", () => {
      expect(taskContracts.list.method).toBe("get");
      expect(taskContracts.list.path).toBe("/api/tasks");
      expect(taskContracts.get.method).toBe("get");
      expect(taskContracts.get.path).toBe("/api/tasks/:id");
      expect(taskContracts.create.method).toBe("post");
      expect(taskContracts.create.path).toBe("/api/tasks");
      expect(taskContracts.update.method).toBe("patch");
      expect(taskContracts.update.path).toBe("/api/tasks/:id");
      expect(taskContracts.delete.method).toBe("delete");
      expect(taskContracts.delete.path).toBe("/api/tasks/:id");
      expect(userContracts.me.method).toBe("get");
      expect(userContracts.me.path).toBe("/api/me");
    });
  });
});
