interface BaseRunwayRequest {
  flight_id: any;
  runway_id: any;
  user_id: any;
  type: any;
}

export interface RunwayRequest extends BaseRunwayRequest {
  id: number | string;
  requested_time: Date;
  status: RequestStatus;
}

export type CreateRunwayRequestInput = BaseRunwayRequest;

export type UpdateRunwayRequestInput = {
  id: number | string;
  status: RequestStatus;
};

export type RequestStatus = "pending" | "approved" | "denied";
