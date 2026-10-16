import {
  Task,
  TaskQuery,
  CreateTaskInput,
  UpdateTaskInput,
  TaskListResponse,
  User,
} from "@apibridge/contracts";
import { initialUsers, initialTasks } from "./seed";

const priorityWeight: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export class TaskRepository {
  private tasks: Task[];

  constructor(initialData: Task[] = initialTasks) {
    this.tasks = [...initialData];
  }

  list(query: TaskQuery): TaskListResponse {
    let filtered = [...this.tasks];

    // Filter by status
    if (query.status) {
      filtered = filtered.filter((t) => t.status === query.status);
    }

    // Filter by priority
    if (query.priority) {
      filtered = filtered.filter((t) => t.priority === query.priority);
    }

    // Search by title or description
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower),
      );
    }

    // Sort
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "priority") {
        comparison = (priorityWeight[a.priority] ?? 0) - (priorityWeight[b.priority] ?? 0);
      } else if (sortBy === "updatedAt") {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    const total = filtered.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  getById(id: string): Task | null {
    return this.tasks.find((t) => t.id === id) || null;
  }

  create(data: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title,
      description: data.description ?? "",
      status: data.status ?? "todo",
      priority: data.priority ?? "medium",
      assigneeId: data.assigneeId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.unshift(newTask);
    return newTask;
  }

  update(id: string, data: UpdateTaskInput): Task | null {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const existing = this.tasks[index]!;
    const updated: Task = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.tasks[index] = updated;
    return updated;
  }

  delete(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    return true;
  }
}

export class UserRepository {
  private users: User[];

  constructor(initialData: User[] = initialUsers) {
    this.users = [...initialData];
  }

  getById(id: string): User | null {
    return this.users.find((u) => u.id === id) || null;
  }

  getAll(): User[] {
    return [...this.users];
  }
}

export const taskRepo = new TaskRepository();
export const userRepo = new UserRepository();
