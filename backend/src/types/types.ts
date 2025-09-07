import { User } from "./interfaces";

export type PublicUser = Pick<User, "id" | "username" | "email" | "role">;
export type UserUpdate = Partial<
  Pick<User, "username" | "email" | "password_hash" | "role">
>;
export type AuthUser = Pick<PublicUser, "id" | "role"> & Partial<PublicUser>;
