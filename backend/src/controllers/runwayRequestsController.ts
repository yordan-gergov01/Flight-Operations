import { Request, Response, NextFunction } from "express";

import * as RunwayRequestsModel from "../models/RunwayRequest";

import { cacheConfig } from "../config/redis";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

import { RequestStatus } from "../types/runway-requests/runway-request-types";

import {
  enqueueRequest,
  updateRequestByStatus,
} from "../services/runway-request-service";
import cacheService from "../services/cache-service";

const createNewRequest = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { flight_id, runway_id, type } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return next(new AppError("Unauthorized", 401));
  }

  const request = await enqueueRequest({
    flight_id,
    runway_id,
    user_id: userId,
    type,
  });

  await cacheService.deletePattern("runway:requests:*").catch((error) => {
    console.error("Failed to invalidate runway requests cache:", error);
  });

  res.status(201).json({
    data: {
      request,
    },
  });
});

const getRequestsByStatus = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { status } = req.query;

  const typedStatus = status as RequestStatus;

  const cacheKey = `runway:requests:status:${typedStatus}`;

  const cachedRequests = await cacheService.get(cacheKey);

  if (cachedRequests) {
    return res.status(200).json({
      data: {
        requests: cachedRequests,
      },
    });
  }

  const requestsByStatus = await RunwayRequestsModel.getRequestsWithStatus(
    typedStatus
  );

  await cacheService
    .set(cacheKey, requestsByStatus, cacheConfig.ttl.short)
    .catch((err) => {
      console.error("Failed to cache runway requests:", err);
    });

  res.status(200).json({
    data: {
      requests: requestsByStatus,
    },
  });
});

const updateRunwayRequest = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { status } = req.query;

  const typedStatus = status as RequestStatus;

  const updatedRequest = await updateRequestByStatus({
    id,
    status: typedStatus,
  });

  if (!updatedRequest) {
    return next(new AppError("Request with that ID is not found.", 404));
  }

  await cacheService.deletePattern("runway:requests:*").catch((error) => {
    console.error("Failed to invalidate runway requests cache:", error);
  });

  res.status(200).json({
    data: {
      request: updatedRequest,
    },
  });
});

export { createNewRequest, getRequestsByStatus, updateRunwayRequest };
