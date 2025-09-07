import { PublicUser } from "../types";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
