import {
  AnyRouteContract,
  InferRouteParams,
  InferRouteQuery,
  InferRouteBody,
  InferRouteResponse,
  ApiError,
} from "@apibridge/contracts";
import {
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
  QueryKey,
} from "@tanstack/react-query";

export interface ApiClientConfig {
  baseUrl: string;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  fetch?: typeof fetch;
}

export class ApiBridgeClientError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly issues?: Array<{ path: Array<string | number>; message: string; code?: string }>;
  public readonly data?: ApiError | unknown;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    issues?: Array<{ path: Array<string | number>; message: string; code?: string }>,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiBridgeClientError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.issues = issues;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type QueryInput<TContract extends AnyRouteContract> =
  InferRouteParams<TContract> extends undefined
    ? InferRouteQuery<TContract> extends undefined
      ? void | undefined
      : InferRouteQuery<TContract>
    : {
        params: InferRouteParams<TContract>;
        query?: InferRouteQuery<TContract>;
      };

export type MutationInput<TContract extends AnyRouteContract> =
  InferRouteParams<TContract> extends undefined
    ? InferRouteBody<TContract> extends undefined
      ? void | undefined
      : InferRouteBody<TContract>
    : InferRouteBody<TContract> extends undefined
      ? InferRouteParams<TContract>
      : {
          params: InferRouteParams<TContract>;
          body: InferRouteBody<TContract>;
        };

export interface RouteClientEndpoint<TContract extends AnyRouteContract> {
  contract: TContract;
  fetch: (input?: unknown, init?: RequestInit) => Promise<InferRouteResponse<TContract, 200 | 201>>;
  getQueryKey: (input?: unknown) => QueryKey;
  useQuery: (
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
  ) => UseQueryResult<InferRouteResponse<TContract, 200 | 201>, ApiBridgeClientError>;
  useMutation: <TContext = unknown>(
    options?: UseMutationOptions<
      InferRouteResponse<TContract, 200 | 201>,
      ApiBridgeClientError,
      unknown,
      TContext
    >,
  ) => UseMutationResult<
    InferRouteResponse<TContract, 200 | 201>,
    ApiBridgeClientError,
    unknown,
    TContext
  >;
}

export type TypedApiClient<TContracts> = {
  [K in keyof TContracts]: TContracts[K] extends AnyRouteContract
    ? RouteClientEndpoint<TContracts[K]>
    : TypedApiClient<TContracts[K]>;
};
