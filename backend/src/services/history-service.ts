import { config } from "../config/config";

import HistoryStack from "../data/historyStack";

import { createHistoryEvent, getHistoryEvents } from "../models/History";
import { CreateHistoryInput } from "../types/history/history-types";

import { History } from "../types/general-interfaces";

const historyStack = new HistoryStack(config.eventsLimit);

(async () => {
  const events = await getHistoryEvents(config.eventsLimit);
  events.reverse().forEach((event) => historyStack.addOneEvent(event));
})();

export const addHistoryEvent = async function (
  input: CreateHistoryInput
): Promise<History> {
  const event = await createHistoryEvent(input);

  // TODO: think over special edge case, if it already exists in the stack
  historyStack.addOneEvent(event);

  return event;
};

export const getStackedHistoryEvents = function (): History[] | string {
  return historyStack.getAllEvents();
};

export const getLastHistoryEvent = function (): History | string {
  return historyStack.getLastStacked();
};
