export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler =
  (fn: (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>) =>
  (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
