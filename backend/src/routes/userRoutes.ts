import express from "express";

import { signUp, login, logout } from "../controllers/authController";
import {
  getUsers,
  getProfile,
  updateUser,
  deleteUser,
} from "../controllers/userController";

import protect from "../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("login", login);
userRouter.get("/logout", logout);

userRouter.use(protect);

userRouter.get("/me", getProfile);

// TODO: add admin role with logic to restrict updateUser, getAllUsers, deleteUser

export default userRouter;
