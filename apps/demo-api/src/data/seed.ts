import { User, Task } from "@ahmed109/apibridge-contracts";

export const initialUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    email: "alex.rivera@apibridge.dev",
    role: "admin",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "user-2",
    name: "Jordan Chen",
    email: "jordan.chen@apibridge.dev",
    role: "developer",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "user-3",
    name: "Taylor Smith",
    email: "taylor.smith@apibridge.dev",
    role: "designer",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces",
  },
];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Define core ApiBridge contract schema",
    description:
      "Structure Zod schemas for shared full-stack types and runtime request/response validation.",
    status: "done",
    priority: "high",
    assigneeId: "user-1",
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-15T11:30:00.000Z",
  },
  {
    id: "task-2",
    title: "Implement Express route adapter and OpenAPI generator",
    description:
      "Ensure runtime validation matches contract rules and generates interactive Swagger documentation.",
    status: "done",
    priority: "high",
    assigneeId: "user-2",
    createdAt: "2026-10-15T12:00:00.000Z",
    updatedAt: "2026-10-15T17:00:00.000Z",
  },
  {
    id: "task-3",
    title: "Create React TanStack Query client factory",
    description: "Provide typed hooks with caching, optimistic mutations, and custom query keys.",
    status: "in_progress",
    priority: "high",
    assigneeId: "user-2",
    createdAt: "2026-10-16T08:00:00.000Z",
    updatedAt: "2026-10-16T14:15:00.000Z",
  },
  {
    id: "task-4",
    title: "Design task management dashboard mockups",
    description: "Craft modern developer tool aesthetics with overview charts and status badges.",
    status: "done",
    priority: "medium",
    assigneeId: "user-3",
    createdAt: "2026-10-14T10:00:00.000Z",
    updatedAt: "2026-10-15T16:00:00.000Z",
  },
  {
    id: "task-5",
    title: "Build Interactive API Explorer view",
    description: "Live schema documentation and request sandbox demonstrating zero type drift.",
    status: "in_progress",
    priority: "medium",
    assigneeId: "user-1",
    createdAt: "2026-10-16T11:00:00.000Z",
    updatedAt: "2026-10-16T15:30:00.000Z",
  },
  {
    id: "task-6",
    title: "Audit accessibility for modal dialogs and filter controls",
    description:
      "Verify ARIA labels, focus traps, and keyboard navigation compliance across task management views.",
    status: "todo",
    priority: "low",
    assigneeId: "user-3",
    createdAt: "2026-10-16T13:00:00.000Z",
    updatedAt: "2026-10-16T13:00:00.000Z",
  },
  {
    id: "task-7",
    title: "Implement contract-driven E2E integration test suite",
    description:
      "Verify that invalid query and body payloads produce standard RFC 7807 compliant error contracts.",
    status: "todo",
    priority: "medium",
    assigneeId: "user-2",
    createdAt: "2026-10-16T14:00:00.000Z",
    updatedAt: "2026-10-16T14:00:00.000Z",
  },
  {
    id: "task-8",
    title: "Document migration guide from REST to ApiBridge",
    description:
      "Write comprehensive developer documentation showing before/after code comparisons.",
    status: "todo",
    priority: "low",
    assigneeId: null,
    createdAt: "2026-10-16T15:00:00.000Z",
    updatedAt: "2026-10-16T15:00:00.000Z",
  },
];
