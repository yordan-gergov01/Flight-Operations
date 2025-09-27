import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";
import { JwtPayloadWithId } from "../types/general-interfaces";

import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import * as UserModel from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

const protect = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1) Getting token and check of it's there
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verification token
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadWithId;

  // 3) Check if user still exists
  const currentUser = await UserModel.getUserByid(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Grant access to protected route
  // only if everything is correct
  req.user = currentUser;
  next();
});

export default protect;
