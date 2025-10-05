import express from "express";

import {
  getRequestsByStatus,
  createNewRequest,
  updateRunwayRequest,
} from "../controllers/runwayRequestsController";

import protect from "../middlewares/authMiddleware";

const runwayRequestsRouter = express.Router();

runwayRequestsRouter.post("/", protect, createNewRequest);
runwayRequestsRouter.get("/", protect, getRequestsByStatus);
runwayRequestsRouter.patch("/:id", protect, updateRunwayRequest);

export default runwayRequestsRouter;
