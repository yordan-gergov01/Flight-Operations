import { History } from "../types/general-interfaces";

/**
 * A fixed-size stack-like structure for managing recent history events in memory.
 *
 * @class HistoryStack
 * @description
 * Maintains a bounded collection of `History` events. When the stack
 * reaches the configured capacity, the oldest event is automatically
 * removed. Designed for quick read access to recent events without
 * querying the database.
 */

class HistoryStack {
  /** Internal list of stored history events. */
  private events: History[] = [];

  /** Maximum number of events allowed in the stack. */
  private eventsLimit: number;

  /**
   * Creates a new HistoryStack instance.
   *
   * @constructor
   * @param {number} eventsLimit - Maximum allowed events before older entries are discarded.
   */
  public constructor(eventsLimit: number) {
    this.eventsLimit = eventsLimit;
  }

  /**
   * Checks whether the stack is empty.
   *
   * @private
   * @function isEmpty
   * @returns {boolean} True if no events are stored, otherwise false.
   */
  private isEmpty() {
    return this.events.length === 0;
  }

  /**
   * Adds a new event to the stack. If the stack has reached its capacity,
   * the oldest event is automatically removed.
   *
   * @function addOneEvent
   * @param {History} element - The history event to store.
   *
   * @returns {number} The new length of the events array after insertion.
   *
   * @description
   * Implements a sliding-window mechanism that keeps only the most
   * recent N events in memory (defined by `eventsLimit`).
   */
  public addOneEvent(element: History) {
    if (this.events.length >= this.eventsLimit) {
      this.events.shift();
    }

    return this.events.push(element);
  }

  /**
   * Removes the most recently added event from the stack.
   *
   * @function removeOneEvent
   * @returns {History | string}
   * - The removed event
   * - A user-friendly message if the stack is empty
   *
   * @description
   * Operates similar to pop() on a stack, but includes safe handling
   * for the empty state.
   */
  public removeOneEvent() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events.pop();
  }

  /**
   * Retrieves the most recent event in the stack without removing it.
   *
   * @function getLastStacked
   * @returns {History | string}
   * - The last event
   * - A message if no events exist
   *
   * @description
   * Useful for quickly determining the latest system activity.
   */
  public getLastStacked() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events[this.events.length - 1];
  }

  /**
   * Returns all stored events currently in the stack.
   *
   * @function getAllEvents
   * @returns {History[] | string}
   * - An array of all stored history events
   * - A message if the stack is empty
   *
   * @description
   * Provides full visibility into the in-memory event history.
   */
  public getAllEvents() {
    if (this.isEmpty()) {
      return "History stack is empty.";
    }

    return this.events;
  }

  /**
   * Returns the number of events currently stored in the stack.
   *
   * @function stackSize
   * @returns {number} The total count of stacked events.
   */
  public stackSize() {
    return this.events.length;
  }
}

export default HistoryStack;
