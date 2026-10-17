// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { taskContracts } from "@ahmed109/apibridge-contracts";
import { createApiClient, ApiBridgeClientError } from "../src";

describe("@ahmed109/apibridge-react", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("generates correct query key", () => {
    const api = createApiClient({
      baseUrl: "https://api.example.com",
      contracts: { tasks: taskContracts },
    });

    const key = api.tasks.list.getQueryKey({ status: "todo", page: 1 });
    expect(key).toEqual(["/api/tasks", "get", { status: "todo", page: 1 }]);
  });

  it("fetches data successfully via useQuery", async () => {
    const mockTasks = {
      items: [
        {
          id: "task-101",
          title: "Unit Test Task",
          description: "Testing react hook",
          status: "todo",
          priority: "high",
          assigneeId: null,
          createdAt: "2026-10-16T12:00:00.000Z",
          updatedAt: "2026-10-16T12:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockTasks,
    });

    const api = createApiClient({
      baseUrl: "https://api.example.com",
      contracts: { tasks: taskContracts },
      fetch: mockFetch,
    });

    const { result } = renderHook(() => api.tasks.list.useQuery({ status: "todo", page: 1 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockTasks);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/tasks?status=todo&page=1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("executes useMutation and posts body", async () => {
    const createdTask = {
      id: "new-task-1",
      title: "Created via hook",
      description: "Awesome description",
      status: "todo",
      priority: "high",
      assigneeId: null,
      createdAt: "2026-10-16T12:00:00.000Z",
      updatedAt: "2026-10-16T12:00:00.000Z",
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => createdTask,
    });

    const api = createApiClient({
      baseUrl: "https://api.example.com",
      contracts: { tasks: taskContracts },
      fetch: mockFetch,
    });

    const { result } = renderHook(() => api.tasks.create.useMutation(), {
      wrapper,
    });

    result.current.mutate({
      title: "Created via hook",
      description: "Awesome description",
      priority: "high",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(createdTask);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Created via hook",
          description: "Awesome description",
          priority: "high",
        }),
      }),
    );
  });

  it("handles API errors properly throwing ApiBridgeClientError", async () => {
    const errorPayload = {
      statusCode: 400,
      error: "VALIDATION_ERROR",
      message: "Title cannot be empty",
      issues: [{ path: ["title"], message: "Required" }],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => errorPayload,
    });

    const api = createApiClient({
      baseUrl: "https://api.example.com",
      contracts: { tasks: taskContracts },
      fetch: mockFetch,
    });

    const { result } = renderHook(() => api.tasks.create.useMutation(), {
      wrapper,
    });

    result.current.mutate({ title: "" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const err = result.current.error as ApiBridgeClientError;
    expect(err).toBeInstanceOf(ApiBridgeClientError);
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Title cannot be empty");
    expect(err.issues).toHaveLength(1);
  });
});
