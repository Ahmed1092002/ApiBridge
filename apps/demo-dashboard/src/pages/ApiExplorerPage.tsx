import React, { useState } from "react";
import {
  Play,
  ExternalLink,
  Code2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { userContracts, taskContracts, AnyRouteContract } from "@apibridge/contracts";
import { API_BASE_URL } from "../api";

interface EndpointMeta {
  id: string;
  name: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  description: string;
  defaultParams?: Record<string, string>;
  defaultQuery?: Record<string, string>;
  defaultBody?: string;
  contract: AnyRouteContract;
}

const ENDPOINTS: EndpointMeta[] = [
  {
    id: "me",
    name: "Get Current User",
    method: "GET",
    path: "/api/me",
    summary: userContracts.me.summary || "Get authenticated user profile",
    description: userContracts.me.description || "",
    contract: userContracts.me,
  },
  {
    id: "tasks-list",
    name: "List Tasks",
    method: "GET",
    path: "/api/tasks",
    summary: taskContracts.list.summary || "Retrieve paginated tasks",
    description: taskContracts.list.description || "",
    defaultQuery: {
      status: "todo",
      page: "1",
      limit: "5",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    contract: taskContracts.list,
  },
  {
    id: "tasks-get",
    name: "Get Task by ID",
    method: "GET",
    path: "/api/tasks/:id",
    summary: taskContracts.get.summary || "Retrieve single task by ID",
    description: taskContracts.get.description || "",
    defaultParams: {
      id: "task-1",
    },
    contract: taskContracts.get,
  },
  {
    id: "tasks-create",
    name: "Create Task",
    method: "POST",
    path: "/api/tasks",
    summary: taskContracts.create.summary || "Create a new task",
    description: taskContracts.create.description || "",
    defaultBody: JSON.stringify(
      {
        title: "Test contract runtime validation",
        description: "Created via ApiBridge interactive explorer",
        status: "todo",
        priority: "high",
        assigneeId: "user-1",
      },
      null,
      2,
    ),
    contract: taskContracts.create,
  },
  {
    id: "tasks-update",
    name: "Update Task",
    method: "PATCH",
    path: "/api/tasks/:id",
    summary: taskContracts.update.summary || "Update existing task",
    description: taskContracts.update.description || "",
    defaultParams: {
      id: "task-1",
    },
    defaultBody: JSON.stringify(
      {
        status: "in_progress",
        priority: "high",
      },
      null,
      2,
    ),
    contract: taskContracts.update,
  },
  {
    id: "tasks-delete",
    name: "Delete Task",
    method: "DELETE",
    path: "/api/tasks/:id",
    summary: taskContracts.delete.summary || "Delete a task by ID",
    description: taskContracts.delete.description || "",
    defaultParams: {
      id: "task-8",
    },
    contract: taskContracts.delete,
  },
];

export function ApiExplorerPage(): React.JSX.Element {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointMeta>(ENDPOINTS[1]!);
  const [paramInputs, setParamInputs] = useState<Record<string, string>>(
    selectedEndpoint.defaultParams || {},
  );
  const [queryInputs, setQueryInputs] = useState<Record<string, string>>(
    selectedEndpoint.defaultQuery || {},
  );
  const [bodyInput, setBodyInput] = useState<string>(selectedEndpoint.defaultBody || "");

  // Request & Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [_responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<unknown | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectEndpoint = (endpoint: EndpointMeta) => {
    setSelectedEndpoint(endpoint);
    setParamInputs(endpoint.defaultParams || {});
    setQueryInputs(endpoint.defaultQuery || {});
    setBodyInput(endpoint.defaultBody || "");
    setResponseStatus(null);
    setResponseBody(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);

    const startTime = performance.now();

    try {
      // Build URL with path params
      let finalPath = selectedEndpoint.path;
      for (const [key, val] of Object.entries(paramInputs)) {
        finalPath = finalPath.replace(`:${key}`, encodeURIComponent(val));
      }

      // Build Query String
      const queryParams = new URLSearchParams();
      for (const [key, val] of Object.entries(queryInputs)) {
        if (val) {
          queryParams.append(key, val);
        }
      }
      const qs = queryParams.toString();
      const url = `${API_BASE_URL}${finalPath}${qs ? `?${qs}` : ""}`;

      // Headers
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      const userId = localStorage.getItem("demo_user_id");
      if (userId && userId !== "anonymous") {
        headers["x-demo-user-id"] = userId;
      }

      let reqBody: string | undefined;
      if (selectedEndpoint.method !== "GET" && bodyInput.trim().length > 0) {
        headers["Content-Type"] = "application/json";
        reqBody = bodyInput;
      }

      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers,
        body: reqBody,
      });

      const latency = Math.round(performance.now() - startTime);
      setResponseLatency(latency);
      setResponseStatus(res.status);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });
      setResponseHeaders(resHeaders);

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        setResponseBody(json);
      } else {
        const text = await res.text();
        setResponseBody(text);
      }
    } catch (err: unknown) {
      const latency = Math.round(performance.now() - startTime);
      setResponseLatency(latency);
      setResponseStatus(0);
      const message = err instanceof Error ? err.message : "Network request failed";
      setResponseBody({ error: "NETWORK_ERROR", message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (responseBody) {
      navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const methodColors: Record<string, { bg: string; text: string; border: string }> = {
    GET: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    POST: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    PATCH: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    DELETE: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Explorer</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive contract sandbox verifying runtime behavior and schema enforcement.
          </p>
        </div>

        <a
          href={`${API_BASE_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Code2 className="w-4 h-4 text-emerald-600" />
          Open Swagger UI Documentation
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Contract Selector */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Available Contracts
          </div>
          <div className="space-y-1">
            {ENDPOINTS.map((endpoint) => {
              const isSelected = selectedEndpoint.id === endpoint.id;
              const col = methodColors[endpoint.method]!;
              return (
                <button
                  key={endpoint.id}
                  onClick={() => handleSelectEndpoint(endpoint)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${col.bg} ${col.text} ${col.border}`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="truncate">{endpoint.path}</span>
                  </div>
                  <span
                    className={`text-[10px] shrink-0 ${
                      isSelected ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {endpoint.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 px-2 space-y-1">
            <p>
              💡 Notice that the path parameters, query schemas, and body shapes match{" "}
              <code className="text-brand-600">@apibridge/contracts</code> definitions directly.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Sandbox & Response View */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded border ${
                    methodColors[selectedEndpoint.method]!.bg
                  } ${methodColors[selectedEndpoint.method]!.text} ${
                    methodColors[selectedEndpoint.method]!.border
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Send Request
                  </>
                )}
              </button>
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">{selectedEndpoint.summary}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedEndpoint.description}</p>
            </div>

            {/* Path Parameters Input */}
            {selectedEndpoint.defaultParams && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Path Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedEndpoint.defaultParams).map(([key]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        :{key}
                      </label>
                      <input
                        type="text"
                        value={paramInputs[key] || ""}
                        onChange={(e) => setParamInputs({ ...paramInputs, [key]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query Parameters Input */}
            {selectedEndpoint.defaultQuery && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Query Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedEndpoint.defaultQuery).map(([key]) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={queryInputs[key] || ""}
                        onChange={(e) => setQueryInputs({ ...queryInputs, [key]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body JSON Editor */}
            {selectedEndpoint.method !== "GET" && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Request Body (JSON)
                  </h3>
                  <button
                    onClick={() => setBodyInput(selectedEndpoint.defaultBody || "{}")}
                    className="text-[11px] text-brand-600 hover:underline"
                  >
                    Reset Payload
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-900 text-slate-100 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 border border-slate-800"
                />
              </div>
            )}
          </div>

          {/* Response Viewer Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Response
                </span>
                {responseStatus !== null && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-100 text-emerald-800"
                        : responseStatus >= 400 && responseStatus < 500
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {responseStatus >= 200 && responseStatus < 300 ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : responseStatus >= 400 && responseStatus < 500 ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    HTTP {responseStatus}
                  </span>
                )}

                {responseLatency !== null && (
                  <span className="text-xs text-slate-400 font-mono">{responseLatency} ms</span>
                )}
              </div>

              {responseBody !== null && (
                <button
                  onClick={handleCopyResponse}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-950 min-h-[160px] overflow-x-auto text-xs font-mono text-slate-200">
              {isLoading ? (
                <div className="h-32 flex items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for API response...</span>
                </div>
              ) : responseBody !== null ? (
                <pre>{JSON.stringify(responseBody, null, 2)}</pre>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500">
                  Select an endpoint and click "Send Request" to test.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
