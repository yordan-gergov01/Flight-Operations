import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Request, Response, CookieOptions, NextFunction } from "express";

import * as UserModel from "../models/User";

import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

import { User } from "../types/general-interfaces";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const signToken = (id: number) => {
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign({ id }, JWT_SECRET, options);
};

const createSendToken = function (
  user: User,
  statusCode: number,
  res: Response
) {
  if (!user.id) {
    throw new Error("User ID missing for token generation.");
  }

  const token = signToken(user.id);

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) +
        7 * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("jwt", token, cookieOptions);

  // sanitize user to delete password from the output
  const sanitizedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  res.status(statusCode).json({
    status: "success",
    token,
    user: sanitizedUser,
  });
};

const signUp = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(
      new AppError("Username, email, and password are required.", 400)
    );
  }

  const allUsers = await UserModel.getAllUsers();
  const role = allUsers.length === 0 ? "admin" : "user";

  const existingUser = await UserModel.getUserByEmail(email);

  if (existingUser) {
    return next(new AppError("User already exists.", 400));
  }

  try {
    const newUser = await UserModel.createNewUser({
      username,
      email,
      role,
      password_hash: password,
    });

    createSendToken(newUser, 201, res);
  } catch (error: any) {
    return next(new AppError(error.message, 403));
  }
});

const login = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password are required.", 400));
  }

  const user = await UserModel.getUserByEmail(email);

  if (!user) {
    return next(new AppError("Email is not correct.", 401));
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordMatch) {
    return next(new AppError("Password is not correct.", 401));
  }

  createSendToken(user, 200, res);
});

const logout = function (req: Request, res: Response) {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

const restrictTo = function (...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};

export { signUp, login, logout, restrictTo };
