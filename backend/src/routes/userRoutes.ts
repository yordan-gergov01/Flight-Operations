import express from "express";

import {
  signUp,
  login,
  logout,
  restrictTo,
} from "../controllers/authController";
import {
  getUsers,
  getOneUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

import protect from "../middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("login", login);
userRouter.get("/logout", logout);
// TODO: add login for forgot password and reset password

// for the next routes the authentication is must
// because middlewares runs in sequence
userRouter.use(protect);

userRouter.get("/me", getOneUser);
// TODO: add here logic for user that can delete its profile, update its password

userRouter.use(restrictTo("admin"));

userRouter.route("/").get(getUsers);
userRouter.route("/:id").patch(updateUser).delete(deleteUser);

export default userRouter;
