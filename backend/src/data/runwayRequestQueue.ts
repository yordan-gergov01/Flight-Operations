import { RunwayRequest } from "../types/runway-requests/runway-request-types";

/**
 * A FIFO queue implementation for handling runway requests.
 *
 * @class RunwayQueue
 * @description
 * Uses a `Map` internally to preserve insertion order while allowing
 * efficient deletion by ID.
 *
 * Each request is stored under its unique identifier, ensuring fast
 * lookup and controlled queue operations.
 */

class RunwayQueue {
  /** Internal queue storage using insertion-ordered Map. */
  private queue: Map<string, RunwayRequest> = new Map();

  /**
   * Adds a new runway request to the end of the queue.
   *
   * @function enqueue
   * @param {RunwayRequest} request - The runway request to enqueue.
   *
   * @description
   * Ensures the request ID is a string (required as a Map key).
   * If an ID already exists, this operation will overwrite the
   * previous record for that ID.
   */
  enqueue(request: RunwayRequest) {
    if (typeof request.id !== "string") {
      request.id = String(request.id);
    }
    this.queue.set(request.id, request);
  }

  /**
   * Removes and returns the earliest inserted request in the queue.
   *
   * @function dequeue
   * @returns {RunwayRequest | undefined}
   * - The dequeued request
   * - `undefined` if the queue is empty
   *
   * @description
   * Retrieves the first element based on insertion order using
   * `Map.keys().next().value`.
   */
  dequeue(): RunwayRequest | undefined {
    const firstKey = this.queue.keys().next().value;

    if (!firstKey) return undefined;

    const request = this.queue.get(firstKey);
    this.queue.delete(firstKey);

    return request;
  }

  /**
   * Returns all runway requests stored in the queue.
   *
   * @function getAll
   * @returns {RunwayRequest[]} An array of all queued requests.
   *
   * @description
   * The returned order reflects the FIFO insertion order.
   */
  getAll(): RunwayRequest[] {
    return [...this.queue.values()];
  }

  /**
   * Returns the total number of requests currently in the queue.
   *
   * @function size
   * @returns {number} The size of the queue.
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * Removes a specific request from the queue by its ID.
   *
   * @function removeById
   * @param {string} id - The ID of the request to remove.
   * @returns {boolean} True if the request was removed, false otherwise.
   *
   * @description
   * Useful for operations that deny or cancel a runway request.
   */
  removeById(id: string) {
    return this.queue.delete(id);
  }
}

/** Global singleton instance of the runway request queue. */
export const runwayRequestQueue = new RunwayQueue();
