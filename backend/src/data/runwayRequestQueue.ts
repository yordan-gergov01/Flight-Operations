import { RunwayRequest } from "../types/runway-requests/runway-request-types";

export class RunwayQueue {
  private queue: Map<string, RunwayRequest> = new Map();

  enqueue(request: RunwayRequest) {
    if (typeof request.id !== "string") {
      request.id = String(request.id);
    }
    this.queue.set(request.id, request);
  }

  dequeue(): RunwayRequest | undefined {
    const firstKey = this.queue.keys().next().value;

    if (!firstKey) return undefined;

    const request = this.queue.get(firstKey);
    this.queue.delete(firstKey);

    return request;
  }

  getAll(): RunwayRequest[] {
    return [...this.queue.values()];
  }

  size(): number {
    return this.queue.size;
  }

  removeById(id: string) {
    return this.queue.delete(id);
  }
}

export const runwayRequestQueue = new RunwayQueue();
