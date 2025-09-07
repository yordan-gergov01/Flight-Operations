import { Request, Response, NextFunction } from "express";

import * as UserModel from "../models/User";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

const getUsers = catchAsync(async function (req: Request, res: Response) {
  const users = await UserModel.getAllUsers();

  res.status(200).json({
    status: "success",
    length: users.length,
    users,
  });
});

const getProfile = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.user;
  const user = await UserModel.getUserByid(id);

  if (!user) {
    return next(new AppError("User is not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const updateUser = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = Number(req.params.id);
  const { dataForUpdate } = req.body;
  const updatedUser = await UserModel.updateUser(id, dataForUpdate);

  if (!updatedUser) {
    return next(
      new AppError("User for update with this ID is not found.", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

const deleteUser = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = Number(req.params.id);

  await UserModel.deleteUser(id);

  res.status(200).json({
    status: "success",
  });
});

export { getUsers, getProfile, updateUser, deleteUser };
