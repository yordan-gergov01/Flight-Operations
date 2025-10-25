import db from "../config/db";

import { History } from "../types/general-interfaces";
import { CreateHistoryInput } from "../types/history/history-types";

const createHistoryEvent = async function (
  input: CreateHistoryInput
): Promise<History> {
  const [event] = await db("history")
    .insert(input)
    .returning(["id", "request_id", "event_time", "outcome"]);

  return event;
};

const getHistoryEvents = async function (limit = 10): Promise<History[]> {
  return db("history").orderBy("event_time", "desc").limit(limit);
};

const getHistoryEventById = async function (
  id: number
): Promise<History | undefined> {
  return db("history").where({ id }).first();
};

export { createHistoryEvent, getHistoryEvents, getHistoryEventById };
