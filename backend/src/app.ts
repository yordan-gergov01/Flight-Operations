import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import AppError from "./utils/appError";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(helmet());
app.use(cookieParser());
// TODO: add here the client url (for ex. https://localhost:5173 for vite)
app.use(cors());
app.use(morgan("combined"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "OK" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

export default app;
