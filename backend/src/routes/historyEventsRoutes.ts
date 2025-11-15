import express from "express";

import {
  createHistoryEvent,
  getAllEvents,
  getLastEvent,
} from "../controllers/historyEventsController";

import protect from "../middlewares/authMiddleware";

const historyEventsRouter = express.Router();

historyEventsRouter.post("/", protect, createHistoryEvent);
historyEventsRouter.get("/", protect, getAllEvents);
historyEventsRouter.get("/last", protect, getLastEvent);

export default historyEventsRouter;
