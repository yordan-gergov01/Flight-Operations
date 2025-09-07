import { User } from "../types/interfaces";
import { PublicUser, UserUpdate } from "../types/types";

import db from "../config/db";
import bcrypt from "bcrypt";

const getAllUsers = async function (): Promise<PublicUser[]> {
  return db<User>("users").select("id", "username", "email", "role");
};

const getUserByid = async function (
  id: number
): Promise<PublicUser | undefined> {
  return db<User>("users")
    .where({ id })
    .select("id", "username", "email", "role")
    .first();
};

const getUserByEmail = async function (
  email: string
): Promise<User | undefined> {
  return db<User>("users").where({ email }).first();
};

const createNewUser = async function ({
  username,
  email,
  password_hash,
  role = "user",
}: User): Promise<User> {
  const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
  const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

  const [newUser] = await db<User>("users")
    .insert({ username, email, password_hash: hashedPassword, role })
    .returning("*");

  return newUser;
};

const updateUser = async function (
  id: number,
  updatedData: UserUpdate
): Promise<User> {
  const [updatedUser] = await db<User>("users")
    .where({ id })
    .update(updatedData)
    .returning(["id", "username", "email", "password_hash", "role"]);

  return updatedUser;
};

const deleteUser = async function (id: number): Promise<void> {
  return db<User>("users").where({ id }).del();
};

export {
  getAllUsers,
  getUserByid,
  getUserByEmail,
  createNewUser,
  updateUser,
  deleteUser,
};
