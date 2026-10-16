import { z } from "zod";
import { defineRoute } from "../core/contract";
import { standardErrors } from "../core/errors";

export const TaskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskSortFieldSchema = z.enum(["createdAt", "updatedAt", "priority"]);
export type TaskSortField = z.infer<typeof TaskSortFieldSchema>;

export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export const TaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().default(""),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  assigneeId: z.string().nullable().default(null),
  createdAt: z.string().datetime("Must be a valid ISO datetime"),
  updatedAt: z.string().datetime("Must be a valid ISO datetime"),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskParamsSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});
export type TaskParams = z.infer<typeof TaskParamsSchema>;

export const TaskQuerySchema = z.object({
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: TaskSortFieldSchema.default("createdAt"),
  sortOrder: SortOrderSchema.default("desc"),
});
export type TaskQuery = z.infer<typeof TaskQuerySchema>;

export const TaskListResponseSchema = z.object({
  items: z.array(TaskSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

export const CreateTaskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),
  status: TaskStatusSchema.default("todo"),
  priority: TaskPrioritySchema.default("medium"),
  assigneeId: z.string().nullable().optional().default(null),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100).optional(),
  description: z.string().max(1000).optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

export const DeleteTaskResponseSchema = z.object({
  success: z.boolean(),
  id: z.string(),
});
export type DeleteTaskResponse = z.infer<typeof DeleteTaskResponseSchema>;

export const taskContracts = {
  list: defineRoute({
    method: "get",
    path: "/api/tasks",
    summary: "List tasks",
    description: "Retrieve a paginated, filterable, and sorted list of tasks.",
    tags: ["Tasks"],
    query: TaskQuerySchema,
    responses: {
      200: TaskListResponseSchema,
      400: standardErrors[400],
      500: standardErrors[500],
    },
  }),

  get: defineRoute({
    method: "get",
    path: "/api/tasks/:id",
    summary: "Get task by ID",
    description: "Fetch a single task by its unique identifier.",
    tags: ["Tasks"],
    params: TaskParamsSchema,
    responses: {
      200: TaskSchema,
      400: standardErrors[400],
      404: standardErrors[404],
      500: standardErrors[500],
    },
  }),

  create: defineRoute({
    method: "post",
    path: "/api/tasks",
    summary: "Create a new task",
    description: "Create a task with title, optional description, status, priority, and assignee.",
    tags: ["Tasks"],
    body: CreateTaskInputSchema,
    responses: {
      201: TaskSchema,
      400: standardErrors[400],
      401: standardErrors[401],
      500: standardErrors[500],
    },
  }),

  update: defineRoute({
    method: "patch",
    path: "/api/tasks/:id",
    summary: "Update task",
    description: "Partially update an existing task.",
    tags: ["Tasks"],
    params: TaskParamsSchema,
    body: UpdateTaskInputSchema,
    responses: {
      200: TaskSchema,
      400: standardErrors[400],
      401: standardErrors[401],
      404: standardErrors[404],
      500: standardErrors[500],
    },
  }),

  delete: defineRoute({
    method: "delete",
    path: "/api/tasks/:id",
    summary: "Delete task",
    description: "Permanently delete an existing task by ID.",
    tags: ["Tasks"],
    params: TaskParamsSchema,
    responses: {
      200: DeleteTaskResponseSchema,
      400: standardErrors[400],
      401: standardErrors[401],
      404: standardErrors[404],
      500: standardErrors[500],
    },
  }),
};
