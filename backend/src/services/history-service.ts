import { config } from "../config/config";

import HistoryStack from "../data/historyStack";

import { createHistoryEvent, getHistoryEvents } from "../models/History";
import { CreateHistoryInput } from "../types/history/history-types";

import { History } from "../types/general-interfaces";

/**
 * In-memory history stack storing the most recent events.
 * The maximum size is controlled by `config.eventsLimit`.
 */
const historyStack = new HistoryStack(config.eventsLimit);

/**
 * Immediately loads the latest history events from the database
 * and initializes the in-memory stack.
 *
 * @description
 * On service startup, this IIFE fetches the latest events (up to the
 * configured limit), reverses them to maintain chronological order,
 * and pushes them into the stack one by one.
 */

(async () => {
  const events = await getHistoryEvents(config.eventsLimit);
  events.reverse().forEach((event) => historyStack.addOneEvent(event));
})();

/**
 * Creates a new history event in the database and stores it in the in-memory stack.
 *
 * @async
 * @function addHistoryEvent
 * @param {CreateHistoryInput} input - The payload used to create a history event.
 *
 * @returns {Promise<History>} The created history event.
 *
 * @description
 * After persisting the event in the database, the event is appended
 * to the in-memory stack.
 *
 * **Note:** There is a TODO related to handling cases where
 * the event might already exist in the stack. This may occur
 * in scenarios involving retries or duplicated inserts.
 */

export const addHistoryEvent = async function (
  input: CreateHistoryInput
): Promise<History> {
  const event = await createHistoryEvent(input);

  // TODO: think over special edge case, if it already exists in the stack
  historyStack.addOneEvent(event);

  return event;
};

/**
 * Returns all history events currently stored in the in-memory stack.
 *
 * @function getStackedHistoryEvents
 * @returns {History[] | string}
 * - An array containing all stacked history events
 * - A string message if the stack is empty or an error occurs
 *
 * @description
 * This method does NOT perform any database queries—it only returns
 * what is currently cached in memory.
 */

export const getStackedHistoryEvents = function (): History[] | string {
  return historyStack.getAllEvents();
};

/**
 * Retrieves the most recent history event from the in-memory stack.
 *
 * @function getLastHistoryEvent
 * @returns {History | string}
 * - The last event in the stack
 * - A string message if the stack is empty
 *
 * @description
 * Useful for systems that need to quickly determine the latest change
 * without querying the database.
 */

export const getLastHistoryEvent = function (): History | string {
  return historyStack.getLastStacked();
};
