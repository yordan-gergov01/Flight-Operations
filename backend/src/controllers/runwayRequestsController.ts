import { Request, Response, NextFunction } from "express";

import * as RunwayRequestsModel from "../models/RunwayRequest";

import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

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

  const request = await RunwayRequestsModel.createRunwayRequest({
    flight_id,
    runway_id,
    user_id: userId,
    type,
  });

  res.status(201).json({
    status: "success",
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

  const requestsByStatus = await RunwayRequestsModel.getRequestsWithStatus(
    status
  );

  res.status(200).json({
    status: "success",
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
  const updatedRequest = await RunwayRequestsModel.updateRunwayRequest({
    id,
    status,
  });

  if (!updatedRequest) {
    return next(new AppError("Request with that ID is not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      request: updatedRequest,
    },
  });
});

export { createNewRequest, getRequestsByStatus, updateRunwayRequest };
