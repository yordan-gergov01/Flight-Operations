import { Request, Response, NextFunction } from "express";
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  if (!message) message = "Something went wrong!";

  console.error(`ERROR: ${message}`);

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

export default globalErrorHandler;
