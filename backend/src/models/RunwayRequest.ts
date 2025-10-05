import { RunwayRequest } from "../types/general-interfaces";
import db from "../config/db";

import {
  CreateRunwayRequestInput,
  RequestStatus,
  UpdateRunwayRequestInput,
} from "../types/runway-requests/runway-request-types";

const createRunwayRequest = async function ({
  flight_id,
  runway_id,
  user_id,
  type,
}: CreateRunwayRequestInput): Promise<RunwayRequest> {
  const [newRunwayRequest] = await db<RunwayRequest>("runway_requests")
    .insert({
      flight_id,
      runway_id,
      user_id,
      type,
      requested_time: new Date(),
      status: "pending",
    })
    .returning("*");

  return newRunwayRequest;
};

const getRequestsWithStatus = async function (
  status: RequestStatus
): Promise<RunwayRequest[]> {
  return db<RunwayRequest>("runway_requests").where({ status });
};

const updateRunwayRequest = async function ({
  id,
  status,
}: UpdateRunwayRequestInput): Promise<RunwayRequest> {
  const [updatedRequest] = await db<RunwayRequest>("runway_requests")
    .where("id", id)
    .update({ status })
    .returning("*");

  return updatedRequest;
};

export { createRunwayRequest, getRequestsWithStatus, updateRunwayRequest };
