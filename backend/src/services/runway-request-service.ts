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

/**
 * Enqueues a new runway request by creating a database record and
 * pushing the structured request into the in-memory queue.
 *
 * @async
 * @function enqueueRequest
 * @param {BaseRunwayRequest} input - The base request payload.
 * @param {number|string} input.flight_id - Identifier of the flight.
 * @param {number|string} input.runway_id - Identifier of the runway being requested.
 * @param {number|string} input.user_id - ID of the user making the request.
 * @param {"takeoff"|"landing"} input.type - The type of the runway request.
 *
 * @returns {Promise<RunwayRequest>} The newly created runway request.
 *
 * @description
 * This function persists the request in the database, normalizes the
 * returned data into a `RunwayRequest` object, and enqueues it for
 * internal processing.
 */

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

/**
 * Retrieves all pending runway requests currently stored in the queue.
 *
 * @function getAllRequestsFromQueue
 * @returns {RunwayRequest[]} A list of all runway requests in FIFO order.
 *
 * @description
 * The returned array reflects the current state of the queue without
 * modifying it.
 */

export const getAllRequestsFromQueue = function (): RunwayRequest[] {
  return runwayRequestQueue.getAll();
};

/**
 * Dequeues (removes and returns) the next runway request from the queue.
 *
 * @function dequeueRequest
 * @returns {RunwayRequest|undefined} The next request, or undefined if the queue is empty.
 *
 * @description
 * Operates on a FIFO principle. This function mutates the queue by removing
 * the first request in line.
 */

export const dequeueRequest = function (): RunwayRequest | undefined {
  return runwayRequestQueue.dequeue();
};

/**
 * Updates the status of a runway request and synchronizes the queue accordingly.
 *
 * @async
 * @function updateRequestByStatus
 * @param {UpdateRunwayRequestInput} input - The update payload.
 * @param {number|string} input.id - ID of the request that should be updated.
 * @param {"pending"|"approved"|"denied"} input.status - New status for the request.
 *
 * @returns {Promise<RunwayRequest|undefined>} The updated request, or undefined if not found.
 *
 * @description
 * If a request is updated to `"denied"`, it is automatically removed from the queue.
 * This ensures consistency between the database state and the in-memory queue.
 */

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
