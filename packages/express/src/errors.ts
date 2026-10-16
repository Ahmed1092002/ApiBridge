export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly issues?: Array<{ path: Array<string | number>; message: string; code?: string }>;

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    issues?: Array<{ path: Array<string | number>; message: string; code?: string }>,
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.issues = issues;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(
    message = "Bad Request",
    issues?: Array<{ path: Array<string | number>; message: string; code?: string }>,
  ) {
    super(400, "VALIDATION_ERROR", message, issues);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class NotFoundError extends HttpError {
  public readonly resource?: string;

  constructor(message = "Resource not found", resource?: string) {
    super(404, "NOT_FOUND", message);
    this.resource = resource;
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super(500, "INTERNAL_SERVER_ERROR", message);
  }
}
