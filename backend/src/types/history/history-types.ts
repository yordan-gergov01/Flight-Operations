export type CreateHistoryInput = {
  request_id: number;
  event_time: string;
  outcome: "landed" | "departed" | "cancelled";
};
