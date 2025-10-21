import { runwayRequestQueue } from "../data/runwayRequestQueue";
import {
  createRunwayRequest,
  updateRunwayRequest,
} from "../models/RunwayRequest";

import {
  BaseRunwayRequest,
  RunwayRequest,
  UpdateRunwayRequestInput,
} from "../types/runway-requests/runway-request-types";

export const enqueueRequest = async function ({
  flight_id,
  runway_id,
  user_id,
  type,
}: BaseRunwayRequest) {
  const dbRecord = await createRunwayRequest({
    flight_id,
    runway_id,
    user_id,
    type,
  });

  const request: RunwayRequest = {
    id: dbRecord.id,
    flight_id: dbRecord.flight_id,
    runway_id: dbRecord.runway_id,
    user_id: dbRecord.user_id,
    type: dbRecord.type,
    requested_time: dbRecord.requested_time,
    status: dbRecord.status,
  };

  runwayRequestQueue.enqueue(request);

  return request;
};

export const getAllRequestsFromQueue = function (): RunwayRequest[] {
  return runwayRequestQueue.getAll();
};

export const dequeueRequest = function (): RunwayRequest | undefined {
  return runwayRequestQueue.dequeue();
};

export const updateRequestByStatus = async function ({
  id,
  status,
}: UpdateRunwayRequestInput): Promise<RunwayRequest | undefined> {
  const updatedRequest = await updateRunwayRequest({ id, status });

  if (updatedRequest && status === "denied") {
    runwayRequestQueue.removeById(String(id));
  }

  return updatedRequest;
};
