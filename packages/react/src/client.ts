import { AnyRouteContract, InferRouteResponse } from "@ahmed109/apibridge-contracts";
import {
  useQuery as useTanStackQuery,
  useMutation as useTanStackMutation,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  ApiClientConfig,
  ApiBridgeClientError,
  RouteClientEndpoint,
  TypedApiClient,
} from "./types";

interface ParsedRequestInput {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
}

/**
 * Normalizes various caller input styles into structured params, query, and body.
 */
function normalizeInput(contract: AnyRouteContract, input: unknown): ParsedRequestInput {
  if (!input || typeof input !== "object") {
    // If input is a primitive and route expects a single param :id
    if (contract.params && (typeof input === "string" || typeof input === "number")) {
      return { params: { id: String(input) } };
    }
    return {};
  }

  const obj = input as Record<string, unknown>;

  // If the caller explicitly passed structured keys { params, query, body }
  if ("params" in obj || "query" in obj || "body" in obj) {
    return {
      params: (obj.params as Record<string, unknown>) || undefined,
      query: (obj.query as Record<string, unknown>) || undefined,
      body: obj.body,
    };
  }

  // Otherwise, intelligently map fields based on route contract
  const hasParams = Boolean(contract.params);
  const hasBody = Boolean(contract.body);
  const isGet = contract.method.toLowerCase() === "get";

  if (isGet) {
    // For GET: if route has params (like :id), separate id from rest (query)
    if (hasParams && "id" in obj) {
      const { id, ...rest } = obj;
      return {
        params: { id },
        query: Object.keys(rest).length > 0 ? rest : undefined,
      };
    }
    return { query: obj };
  }

  // For non-GET (POST, PATCH, DELETE)
  if (hasParams && "id" in obj) {
    const { id, ...rest } = obj;
    return {
      params: { id },
      body: hasBody ? rest : undefined,
    };
  }

  if (hasBody) {
    return { body: obj };
  }

  return { query: obj };
}

/**
 * Builds endpoint URL with replaced path parameters and query strings.
 */
function buildUrl(
  baseUrl: string,
  contractPath: string,
  params?: Record<string, unknown>,
  query?: Record<string, unknown>,
): string {
  // Strip trailing slash from baseUrl
  const cleanBase = baseUrl.replace(/\/+$/, "");
  let interpolatedPath = contractPath;

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      interpolatedPath = interpolatedPath.replace(`:${key}`, encodeURIComponent(String(val)));
    }
  }

  let url = `${cleanBase}${interpolatedPath}`;

  if (query) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  return url;
}

/**
 * Creates a client endpoint wrapper for a single RouteContract.
 */
function createEndpoint<TContract extends AnyRouteContract>(
  contract: TContract,
  config: ApiClientConfig,
): RouteClientEndpoint<TContract> {
  const fetchFn = config.fetch || globalThis.fetch;

  const executeFetch = async (
    input?: unknown,
    init?: RequestInit,
  ): Promise<InferRouteResponse<TContract, 200 | 201>> => {
    const { params, query, body } = normalizeInput(contract, input);
    const url = buildUrl(config.baseUrl, contract.path, params, query);

    const customHeaders = config.getHeaders ? await config.getHeaders() : {};
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...customHeaders,
      ...((init?.headers as Record<string, string>) || {}),
    };

    let serializedBody: string | undefined;
    if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      serializedBody = typeof body === "string" ? body : JSON.stringify(body);
    }

    const response = await fetchFn(url, {
      method: contract.method.toUpperCase(),
      headers,
      body: serializedBody,
      ...init,
    });

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const errorData = (typeof data === "object" && data !== null ? data : {}) as Record<
        string,
        unknown
      >;
      throw new ApiBridgeClientError(
        response.status,
        typeof errorData.error === "string" ? errorData.error : "REQUEST_FAILED",
        typeof errorData.message === "string"
          ? errorData.message
          : response.statusText || "Request failed",
        errorData.issues as
          Array<{ path: Array<string | number>; message: string; code?: string }> | undefined,
        errorData,
      );
    }

    return data as InferRouteResponse<TContract, 200 | 201>;
  };

  const getQueryKey = (input?: unknown): QueryKey => {
    return [contract.path, contract.method, input || {}];
  };

  const useQuery = (
    input?: unknown,
    options?: Omit<
      UseQueryOptions<
        InferRouteResponse<TContract, 200 | 201>,
        ApiBridgeClientError,
        InferRouteResponse<TContract, 200 | 201>,
        QueryKey
      >,
      "queryKey" | "queryFn"
    >,
  ): UseQueryResult<InferRouteResponse<TContract, 200 | 201>, ApiBridgeClientError> => {
    return useTanStackQuery({
      queryKey: getQueryKey(input),
      queryFn: () => executeFetch(input),
      ...options,
    });
  };

  const useMutation = <TContext = unknown>(
    options?: UseMutationOptions<
      InferRouteResponse<TContract, 200 | 201>,
      ApiBridgeClientError,
      unknown,
      TContext
    >,
  ): UseMutationResult<
    InferRouteResponse<TContract, 200 | 201>,
    ApiBridgeClientError,
    unknown,
    TContext
  > => {
    return useTanStackMutation({
      mutationFn: (mutationInput: unknown) => executeFetch(mutationInput),
      ...options,
    });
  };

  return {
    contract,
    fetch: executeFetch,
    getQueryKey,
    useQuery,
    useMutation,
  };
}

/**
 * Creates a fully typed ApiBridge client from contracts.
 */
export function createApiClient<TContracts extends Record<string, unknown>>(options: {
  baseUrl: string;
  contracts: TContracts;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  fetch?: typeof fetch;
}): TypedApiClient<TContracts> {
  const config: ApiClientConfig = {
    baseUrl: options.baseUrl,
    getHeaders: options.getHeaders,
    fetch: options.fetch,
  };

  function buildTree(node: unknown): unknown {
    if (!node || typeof node !== "object") return node;

    // Check if this object is a RouteContract
    if ("method" in node && "path" in node && "responses" in node) {
      return createEndpoint(node as AnyRouteContract, config);
    }

    const res: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      res[key] = buildTree(value);
    }
    return res;
  }

  return buildTree(options.contracts) as TypedApiClient<TContracts>;
}
