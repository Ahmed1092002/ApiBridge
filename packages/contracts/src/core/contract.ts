import { z } from "zod";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
export type RouteAuth = "public" | "optional" | "required";

export interface RouteContract<
  TMethod extends HttpMethod = HttpMethod,
  TParams extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  TQuery extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  TBody extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
  TResponses extends Record<number, z.ZodTypeAny> = Record<number, z.ZodTypeAny>,
  THeaders extends z.ZodTypeAny | undefined = z.ZodTypeAny | undefined,
> {
  method: TMethod;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  /** Optional schema for headers required by this endpoint. */
  headers?: THeaders;
  /** Documents whether the route is public, optionally authenticated, or protected. */
  auth?: RouteAuth;
  /** Optional application-specific permissions required by this endpoint. */
  permissions?: readonly string[];
  /** Optional OpenAPI security requirements, e.g. [{ bearerAuth: [] }]. */
  security?: Record<string, string[]>[];
  responses: TResponses;
}

export type AnyRouteContract = RouteContract<
  HttpMethod,
  z.ZodTypeAny | undefined,
  z.ZodTypeAny | undefined,
  z.ZodTypeAny | undefined,
  Record<number, z.ZodTypeAny>
>;

/**
 * Defines a type-safe API route contract that can be shared between server and client.
 */
export function defineRoute<
  TMethod extends HttpMethod,
  TParams extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponses extends Record<number, z.ZodTypeAny> = Record<number, z.ZodTypeAny>,
  THeaders extends z.ZodTypeAny | undefined = undefined,
>(route: {
  method: TMethod;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  headers?: THeaders;
  auth?: RouteAuth;
  permissions?: readonly string[];
  security?: Record<string, string[]>[];
  responses: TResponses;
}): RouteContract<TMethod, TParams, TQuery, TBody, TResponses, THeaders> {
  return route;
}

export type InferRouteParams<T> =
  T extends RouteContract<HttpMethod, infer P, infer _Q, infer _B, infer _R>
    ? P extends z.ZodTypeAny
      ? z.infer<P>
      : undefined
    : undefined;

export type InferRouteQuery<T> =
  T extends RouteContract<HttpMethod, infer _P, infer Q, infer _B, infer _R>
    ? Q extends z.ZodTypeAny
      ? z.infer<Q>
      : undefined
    : undefined;

export type InferRouteBody<T> =
  T extends RouteContract<HttpMethod, infer _P, infer _Q, infer B, infer _R>
    ? B extends z.ZodTypeAny
      ? z.infer<B>
      : undefined
    : undefined;

export type InferRouteHeaders<T> =
  T extends RouteContract<HttpMethod, infer _P, infer _Q, infer _B, infer _R, infer H>
    ? H extends z.ZodTypeAny
      ? z.infer<H>
      : undefined
    : undefined;

export type InferRouteResponse<T, TStatus extends number = 200> = TStatus extends unknown
  ? T extends RouteContract<HttpMethod, infer _P, infer _Q, infer _B, infer R>
    ? TStatus extends keyof R
      ? R[TStatus] extends z.ZodTypeAny
        ? z.infer<R[TStatus]>
        : never
      : never
    : never
  : never;
