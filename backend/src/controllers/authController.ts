import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Response, CookieOptions } from "express";

import * as UserModel from "../models/User";

import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

import { User } from "../types/interfaces";

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
