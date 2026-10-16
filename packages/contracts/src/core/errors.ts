import { z } from "zod";

export const ValidationErrorIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
  code: z.string().optional(),
});
export type ValidationErrorIssue = z.infer<typeof ValidationErrorIssueSchema>;

export const ValidationErrorSchema = z.object({
  statusCode: z.literal(400),
  error: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  issues: z.array(ValidationErrorIssueSchema),
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const UnauthorizedErrorSchema = z.object({
  statusCode: z.literal(401),
  error: z.literal("UNAUTHORIZED"),
  message: z.string(),
});
export type UnauthorizedError = z.infer<typeof UnauthorizedErrorSchema>;

export const NotFoundErrorSchema = z.object({
  statusCode: z.literal(404),
  error: z.literal("NOT_FOUND"),
  message: z.string(),
  resource: z.string().optional(),
});
export type NotFoundError = z.infer<typeof NotFoundErrorSchema>;

export const InternalServerErrorSchema = z.object({
  statusCode: z.literal(500),
  error: z.literal("INTERNAL_SERVER_ERROR"),
  message: z.string(),
});
export type InternalServerError = z.infer<typeof InternalServerErrorSchema>;

export const ApiErrorSchema = z.union([
  ValidationErrorSchema,
  UnauthorizedErrorSchema,
  NotFoundErrorSchema,
  InternalServerErrorSchema,
]);
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const standardErrors = {
  400: ValidationErrorSchema,
  401: UnauthorizedErrorSchema,
  404: NotFoundErrorSchema,
  500: InternalServerErrorSchema,
} as const;
