export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || undefined;
  }
  static badRequest(msg = "Bad request", code) {
    return new ApiError(400, msg, code);
  }
  static unauthorized(msg = "Unauthorized", code) {
    return new ApiError(401, msg, code);
  }
  static notFound(msg = "Not found", code) {
    return new ApiError(404, msg, code);
  }
  static notImplemented(msg = "Not implemented", code) {
    return new ApiError(501, msg, code);
  }
}
