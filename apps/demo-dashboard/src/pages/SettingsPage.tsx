import React from "react";
import { ShieldAlert, ShieldCheck, Cpu, CheckCircle2, AlertOctagon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function SettingsPage(): React.JSX.Element {
  const { currentUser, selectedUserId, switchUser, availableUsers } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Simulate roles, test authentication contracts, and explore the ApiBridge architecture.
        </p>
      </div>

      {/* Demo User Switcher Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Demo User Persona</h2>
            <p className="text-xs text-slate-500">
              ApiBridge routes inspect the{" "}
              <code className="font-mono text-brand-600">x-demo-user-id</code> header to enforce
              authentication contracts.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {selectedUserId === "anonymous" ? "No Auth Header" : `ID: ${selectedUserId}`}
          </span>
        </div>

        {/* User Persona Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableUsers.map((user) => {
            const isSelected = selectedUserId === user.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{user.name}</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="capitalize font-semibold text-slate-600">{user.role}</span>
                  <span className="text-emerald-600 font-medium">Permitted</span>
                </div>
              </button>
            );
          })}

          {/* Anonymous Persona */}
          <button
            onClick={() => switchUser("anonymous")}
            className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between gap-3 ${
              selectedUserId === "anonymous"
                ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm"
                : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {selectedUserId === "anonymous" && (
              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">Anonymous</h3>
                <p className="text-xs text-slate-500">No credentials</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="font-semibold text-amber-700">Guest / Unauth</span>
              <span className="text-amber-600 font-medium">401 Errors</span>
            </div>
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-amber-500" />
            )}
            <div className="text-xs">
              <span className="font-bold text-slate-900">
                {currentUser
                  ? `Active Session: ${currentUser.name} (${currentUser.role})`
                  : "Active Session: Unauthenticated"}
              </span>
              <p className="text-slate-500">
                {currentUser
                  ? "Write actions (create, edit, delete) are authorized."
                  : "Attempting to create, update, or delete tasks will immediately trigger a 401 UNAUTHORIZED contract error."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ApiBridge Architecture Deep Dive */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            Zero Type-Drift Architecture
          </div>
          <h2 className="text-base font-bold text-slate-900">
            How ApiBridge Guarantees Full-Stack Type Safety
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            In traditional REST architectures, backend teams maintain Express routes, Swagger
            decorators, and custom validators, while frontend teams maintain duplicate TypeScript
            interfaces. This leads to silent breaking changes and serialization bugs.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              @apibridge/contracts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zod schemas define paths, path params, query parameters, request bodies, and expected
              status codes once in pure TypeScript.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              @apibridge/express
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Route handlers validate incoming requests and outgoing responses at runtime. Generates
              OpenAPI 3.0 specification without boilerplate.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              @apibridge/react
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consumes identical contract schemas to generate TanStack Query hooks (
              <code className="font-mono text-[11px]">useQuery</code>,{" "}
              <code className="font-mono text-[11px]">useMutation</code>) with autocompleted types.
            </p>
          </div>
        </div>

        {/* Visual Flow Box */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
          <p className="text-slate-400 font-sans font-semibold text-xs">
            Contract Data Flow Pipeline:
          </p>
          <div className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-[11px] leading-relaxed text-slate-300 border border-slate-800">
            <div>[ contracts/src/schemas/task.ts ]</div>
            <div className="text-brand-400">
              {" "}
              │─&gt; defines TaskSchema, TaskQuerySchema, CreateTaskInputSchema
            </div>
            <div className="text-slate-600"> │</div>
            <div className="text-indigo-400">
              {" "}
              │─&gt; Express Route: apiBridge.route(taskContracts.create, async ({"{"} body {"}"})
              =&gt; ...)
            </div>
            <div className="text-slate-400">
              {" "}
              │ └─ Runtime validation checks body against CreateTaskInputSchema
            </div>
            <div className="text-slate-600"> │</div>
            <div className="text-emerald-400">
              {" "}
              │─&gt; React Hook: const createTask = api.tasks.create.useMutation()
            </div>
            <div className="text-slate-400">
              {" "}
              │ └─ mutate({"{"} title, priority {"}"}) is strictly typed
            </div>
            <div className="text-slate-600"> │</div>
            <div className="text-amber-400"> └─&gt; OpenAPI 3.0 Document (/docs)</div>
            <div className="text-slate-400">
              {" "}
              └─ Automatically generates schema models for Swagger UI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
