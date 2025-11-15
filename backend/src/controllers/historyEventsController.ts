import { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

import {
  addHistoryEvent,
  getStackedHistoryEvents,
  getLastHistoryEvent,
} from "../services/history-service";

const createHistoryEvent = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { request_id, event_time, outcome } = req.body;

  if (!request_id || !event_time || !outcome) {
    return next(new AppError("Missing required fields", 400));
  }

  const event = await addHistoryEvent({ request_id, event_time, outcome });

  res.status(201).json({
    status: "success",
    data: {
      event,
    },
  });
});

const getAllEvents = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const events = getStackedHistoryEvents();

  if (typeof events === "string") {
    res.status(200).json({
      status: "success",
      message: events, // in this case the value of events is string 'History stack is empty.'
      data: {
        events: [],
      },
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: {
      events,
    },
  });
};

const getLastEvent = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const event = getLastHistoryEvent();

  if (typeof event === "string") {
    res.status(200).json({
      status: "success",
      message: event, // in this case the value of events is string 'History stack is empty.'
      data: {
        event: [],
      },
    });
    return;
  }

  res.status(200).json({
    status: "success",
    data: {
      event,
    },
  });
};

export { createHistoryEvent, getAllEvents, getLastEvent };
