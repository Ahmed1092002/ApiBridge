import { Router, Request } from "express";
import { taskContracts } from "@ahmed109/apibridge-contracts";
import { apiBridge, NotFoundError, UnauthorizedError } from "@ahmed109/apibridge-express";
import { taskRepo, userRepo } from "../data/repository";

export const taskRouter: Router = Router();

function requireAuth(req: Request) {
  const userId = req.headers["x-demo-user-id"];
  if (!userId || typeof userId !== "string") {
    throw new UnauthorizedError(
      "Authentication required for write operations. Provide 'x-demo-user-id' header.",
    );
  }
  const user = userRepo.getById(userId);
  if (!user) {
    throw new UnauthorizedError(`Invalid user credentials for '${userId}'.`);
  }
  return user;
}

// GET /api/tasks
taskRouter.get(
  taskContracts.list.path,
  apiBridge.route(taskContracts.list, async ({ query }) => {
    const result = taskRepo.list(query);
    return {
      status: 200,
      body: result,
    };
  }),
);

// GET /api/tasks/:id
taskRouter.get(
  taskContracts.get.path,
  apiBridge.route(taskContracts.get, async ({ params }) => {
    const task = taskRepo.getById(params.id);
    if (!task) {
      throw new NotFoundError(`Task with ID '${params.id}' was not found`, "Task");
    }
    return {
      status: 200,
      body: task,
    };
  }),
);

// POST /api/tasks
taskRouter.post(
  taskContracts.create.path,
  apiBridge.route(taskContracts.create, async ({ body, req }) => {
    requireAuth(req);
    const created = taskRepo.create(body);
    return {
      status: 201,
      body: created,
    };
  }),
);

// PATCH /api/tasks/:id
taskRouter.patch(
  taskContracts.update.path,
  apiBridge.route(taskContracts.update, async ({ params, body, req }) => {
    requireAuth(req);
    const updated = taskRepo.update(params.id, body);
    if (!updated) {
      throw new NotFoundError(`Task with ID '${params.id}' was not found`, "Task");
    }
    return {
      status: 200,
      body: updated,
    };
  }),
);

// DELETE /api/tasks/:id
taskRouter.delete(
  taskContracts.delete.path,
  apiBridge.route(taskContracts.delete, async ({ params, req }) => {
    requireAuth(req);
    const success = taskRepo.delete(params.id);
    if (!success) {
      throw new NotFoundError(`Task with ID '${params.id}' was not found`, "Task");
    }
    return {
      status: 200,
      body: {
        success: true,
        id: params.id,
      },
    };
  }),
);
