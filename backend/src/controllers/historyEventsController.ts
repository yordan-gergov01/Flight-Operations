import { Request, Response, NextFunction } from "express";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

import {
  addHistoryEvent,
  getStackedHistoryEvents,
  getLastHistoryEvent,
} from "../services/history-service";
import cacheService from "../services/cache-service";
import socketService from "../services/socket-service";

import { cacheConfig } from "../config/redis";

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

  await cacheService.deletePattern("history:*").catch((error) => {
    console.error("Failed to invalidate history cache:", error);
  });

  socketService.emitNewHistoryEvent(event);

  res.status(201).json({
    status: "success",
    data: {
      event,
    },
  });
});

const getAllEvents = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cacheKey = "history:all";

  const cachedEvents = await cacheService.get(cacheKey);

  if (cachedEvents) {
    return res.status(200).json({
      data: {
        events: cachedEvents,
      },
    });
  }

  const events = getStackedHistoryEvents();

  if (typeof events === "string") {
    res.status(200).json({
      message: events, // in this case the value of events is string 'History stack is empty.'
      data: {
        events: [],
      },
    });
    return;
  }

  await cacheService
    .set(cacheKey, events, cacheConfig.ttl.short)
    .catch((error) => {
      console.error("Failed to cache history events: ", error);
    });

  res.status(200).json({
    data: {
      events,
    },
  });
});

const getLastEvent = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cacheKey = "history:last";

  const cachedEvent = await cacheService.get(cacheKey);

  if (cachedEvent) {
    return res.status(200).json({
      data: {
        event: cachedEvent,
      },
    });
  }

  const event = getLastHistoryEvent();

  if (typeof event === "string") {
    res.status(200).json({
      message: event, // in this case the value of events is string 'History stack is empty.'
      data: {
        event: [],
      },
    });
    return;
  }

  await cacheService.set(cacheKey, event, 60).catch((err) => {
    console.error("Failed to cache last history event:", err);
  });

  res.status(200).json({
    data: {
      event,
    },
  });
});

export { createHistoryEvent, getAllEvents, getLastEvent };
