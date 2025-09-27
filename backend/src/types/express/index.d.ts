import { PublicUser } from "../general-types";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}
