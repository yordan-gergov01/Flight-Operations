export interface BaseRunwayRequest {
  flight_id: any;
  runway_id: any;
  user_id: any;
  type: any;
}

export type RequestStatus = "pending" | "approved" | "denied";

export interface RunwayRequest extends BaseRunwayRequest {
  id: number | string;
  requested_time: Date;
  status?: RequestStatus | string;
}

export type CreateRunwayRequestInput = BaseRunwayRequest;

export type UpdateRunwayRequestInput = {
  id: number | string;
  status: RequestStatus;
};
