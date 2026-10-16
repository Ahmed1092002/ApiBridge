import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { api } from "../api";
import { Task } from "@apibridge/contracts";

export function OverviewPage(): React.JSX.Element {
  // Query tasks using typed hook
  const { data, isLoading, isError, error, refetch } = api.tasks.list.useQuery({
    limit: 100,
  });

  const tasks: Task[] = data?.items || [];
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const highPriority = tasks.filter((t) => t.priority === "high").length;
  const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "low").length;

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ApiBridge Active Contracts v1.0
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            System & Task Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Real-time dashboard powered directly by shared TypeScript contracts. All metrics, types,
            and hooks are automatically synchronized with the backend.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            API Explorer
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Manage Tasks
          </Link>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Failed to load overview data</p>
            <p className="text-xs text-rose-700 mt-0.5">{error?.message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-800 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Tasks */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ListTodo className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isLoading ? "-" : totalTasks}
            </span>
            <span className="text-xs text-slate-500">registered</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
            <span className="font-medium text-blue-600">Contract schema:</span>
            <span className="ml-1 text-slate-600">TaskListResponse</span>
          </div>
        </div>

        {/* Todo */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              To Do
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {isLoading ? "-" : todoTasks}
            </span>
            <span className="text-xs text-slate-500">pending action</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
            <span>Requires triage or assignment</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {isLoading ? "-" : inProgressTasks}
            </span>
            <span className="text-xs text-slate-500">active sprint</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
            <span>Currently under development</span>
          </div>
        </div>

        {/* Done */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {isLoading ? "-" : doneTasks}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {completionRate}% rate
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
            <span>Verified & production-ready</span>
          </div>
        </div>
      </div>

      {/* Priority Distribution & Task Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Distribution Bar Chart Widget */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Priority Breakdown</h2>
            <span className="text-xs text-slate-400">by severity</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* High */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> High Priority
                </span>
                <span className="text-slate-700">{highPriority} tasks</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalTasks > 0 ? `${(highPriority / totalTasks) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Priority
                </span>
                <span className="text-slate-700">{mediumPriority} tasks</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalTasks > 0 ? `${(mediumPriority / totalTasks) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Low Priority
                </span>
                <span className="text-slate-700">{lowPriority} tasks</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full transition-all duration-500"
                  style={{
                    width: totalTasks > 0 ? `${(lowPriority / totalTasks) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs text-slate-600">
            Validated by <code className="font-mono text-brand-600">TaskPrioritySchema</code>:{" "}
            <span className="font-semibold text-slate-800">low | medium | high</span>
          </div>
        </div>

        {/* Small Task Analytics Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Contract Health</h2>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Completion Rate
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{completionRate}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">overall progress</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Open Critical
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {tasks.filter((t) => t.priority === "high" && t.status !== "done").length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">high priority active</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Assigned Load
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {tasks.filter((t) => t.assigneeId !== null).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">with assignee</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Unassigned
              </p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">
                {tasks.filter((t) => t.assigneeId === null).length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">available tasks</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-1">
            Zero schema drift detected between frontend and backend.
          </div>
        </div>

        {/* ApiBridge Advantage callout */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
              Single Source of Truth
            </div>
            <h3 className="font-bold text-lg text-white">No handwritten API types</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              If an endpoint parameter changes in{" "}
              <code className="font-mono text-brand-300">@apibridge/contracts</code>, the compiler
              alerts both Express controllers and React hooks immediately.
            </p>
          </div>

          <div className="pt-6">
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 group"
            >
              Inspect live route contracts
              <ArrowRight className="w-3.5 h-3.5 transition group-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Recent Tasks</h2>
            <p className="text-xs text-slate-500">Latest items created across the workspace</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading recent tasks...</div>
        ) : recentTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No tasks found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
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
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {task.description || "No description"}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      task.status === "done"
                        ? "bg-emerald-50 text-emerald-700"
                        : task.status === "in_progress"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.status === "done"
                          ? "bg-emerald-500"
                          : task.status === "in_progress"
                            ? "bg-indigo-500"
                            : "bg-slate-400"
                      }`}
                    />
                    {task.status.replace("_", " ")}
                  </span>

                  <span className="text-xs text-slate-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
