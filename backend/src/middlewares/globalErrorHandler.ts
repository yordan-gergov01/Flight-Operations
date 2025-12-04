import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import logger from "../utils/logger";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = "Something went wrong!";

  const errorDetails = {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error("Server error:", errorDetails);
  } else if (statusCode >= 400) {
    logger.warn("Client error:", errorDetails);
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  const response: any = {
    status: "error",
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.error = err;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default globalErrorHandler;
