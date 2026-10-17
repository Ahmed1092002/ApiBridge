import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Edit3,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  User as UserIcon,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskSortField,
  SortOrder,
} from "@ahmed109/apibridge-contracts";
import { ApiBridgeClientError } from "@ahmed109/apibridge-react";
import { useQueryClient } from "@tanstack/react-query";

export function TasksPage(): React.JSX.Element {
  const { availableUsers } = useAuth();
  const queryClient = useQueryClient();

  // Query Filter & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TaskSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch tasks using ApiBridge typed hook
  const { data, isLoading, isError, error, refetch } = api.tasks.list.useQuery({
    search: search.trim() || undefined,
    status: statusFilter !== "all" ? (statusFilter as TaskStatus) : undefined,
    priority: priorityFilter !== "all" ? (priorityFilter as TaskPriority) : undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  // 2. Typed Mutations from @ahmed109/apibridge-react
  const createTaskMutation = api.tasks.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.contract.path] });
      setIsCreateOpen(false);
      setFormError(null);
      showToast("success", "Task created successfully!");
    },
    onError: (err: ApiBridgeClientError) => {
      setFormError(err.message || "Failed to create task");
      showToast("error", err.message || "Failed to create task");
    },
  });

  const updateTaskMutation = api.tasks.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.contract.path] });
      setEditingTask(null);
      setFormError(null);
      showToast("success", "Task updated successfully!");
    },
    onError: (err: ApiBridgeClientError) => {
      setFormError(err.message || "Failed to update task");
      showToast("error", err.message || "Failed to update task");
    },
  });

  const deleteTaskMutation = api.tasks.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.contract.path] });
      setDeletingTask(null);
      showToast("success", "Task deleted successfully!");
    },
    onError: (err: ApiBridgeClientError) => {
      showToast("error", err.message || "Failed to delete task");
    },
  });

  // Form Submission Handlers
  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const status = formData.get("status") as TaskStatus;
    const priority = formData.get("priority") as TaskPriority;
    const assigneeId = (formData.get("assigneeId") as string) || null;

    if (!title) {
      setFormError("Title is required");
      return;
    }

    createTaskMutation.mutate({
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId === "none" ? null : assigneeId,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask) return;
    setFormError(null);
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const status = formData.get("status") as TaskStatus;
    const priority = formData.get("priority") as TaskPriority;
    const assigneeId = (formData.get("assigneeId") as string) || null;

    updateTaskMutation.mutate({
      params: { id: editingTask.id },
      body: {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId === "none" ? null : assigneeId,
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingTask) return;
    deleteTaskMutation.mutate({
      params: { id: deletingTask.id },
    });
  };

  const tasks = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold animate-slideUp ${
            toastMessage.type === "success"
              ? "bg-emerald-950 text-emerald-200 border-emerald-800"
              : "bg-rose-950 text-rose-200 border-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Task Manager</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            CRUD operations powered by{" "}
            <code className="font-mono text-brand-600">@ahmed109/apibridge-contracts</code> and{" "}
            <code className="font-mono text-brand-600">@ahmed109/apibridge-react</code> hooks.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort Field & Order */}
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSortField)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="priority">Priority</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-1 text-[11px] font-bold text-brand-600 uppercase hover:underline"
              title="Toggle sort direction"
            >
              {sortOrder}
            </button>
          </div>
        </div>
      </div>

      {/* Task List or States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="flex justify-between pt-2">
                <div className="h-5 bg-slate-200 rounded w-16"></div>
                <div className="h-5 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-rose-900">Failed to load tasks</h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg"
          >
            Retry Request
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No tasks found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No tasks match your current search or filter criteria. Try resetting filters or create a
            new task.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task: Task) => {
            const assignee = availableUsers.find((u) => u.id === task.assigneeId);
            return (
              <div
                key={task.id}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{task.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setFormError(null);
                          setEditingTask(task);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Edit Task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Status & Priority Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        task.status === "done"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : task.status === "in_progress"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>

                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        task.priority === "high"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : task.priority === "medium"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Assignee Avatar */}
                  <div className="flex items-center gap-1.5">
                    {assignee ? (
                      <div
                        className="flex items-center gap-1 text-xs text-slate-600"
                        title={assignee.name}
                      >
                        <img
                          src={assignee.avatarUrl}
                          alt={assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-medium hidden sm:inline truncate max-w-[80px]">
                          {assignee.name.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Showing</span>
          <span className="font-semibold text-slate-900">
            {total === 0 ? 0 : (page - 1) * limit + 1}
          </span>
          <span>to</span>
          <span className="font-semibold text-slate-900">{Math.min(page * limit, total)}</span>
          <span>of</span>
          <span className="font-semibold text-slate-900">{total}</span>
          <span>results</span>

          <span className="mx-2 text-slate-300">|</span>

          <span>Page size:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-1.5 py-0.5"
          >
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New Task</h2>
                <p className="text-xs text-slate-500">Contract schema: CreateTaskInputSchema</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Implement contract telemetry"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Details, acceptance criteria, or design notes..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue="todo"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  name="assigneeId"
                  defaultValue="none"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                >
                  <option value="none">Unassigned</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg shadow-sm transition"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Task</h2>
                <p className="text-xs text-slate-500">Task ID: {editingTask.id}</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={editingTask.title}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingTask.description}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingTask.status}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTask.priority}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
                <select
                  name="assigneeId"
                  defaultValue={editingTask.assigneeId || "none"}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
                >
                  <option value="none">Unassigned</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-lg shadow-sm transition"
                >
                  {updateTaskMutation.isPending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">Delete Task</h2>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-slate-800">"{deletingTask.title}"</span>? This
                action cannot be undone.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteTaskMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-lg shadow-sm transition"
              >
                {deleteTaskMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
