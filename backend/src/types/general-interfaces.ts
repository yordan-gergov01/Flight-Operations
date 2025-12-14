import { JwtPayload } from "jsonwebtoken";

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  role?: string;
  created_at?: Date;
}

export interface Airport {
  id: number;
  icao_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Runway {
  id: number;
  airport_id: number;
  identifier: string;
  length_m: number;
  heading_deg: number;
}

export interface Flight {
  id: number;
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  last_seen: Date;
}

export interface RunwayRequest {
  id: number;
  flight_id: number;
  runway_id: number;
  user_id: number;
  type: string;
  requested_time: Date;
  status: string;
}

export interface History {
  id: number;
  request_id: number;
  event_time: Date;
  outcome: string;
}

export interface Alert {
  id: number;
  request1_id: number;
  request2_id: number;
  type: string;
  created_at: Date;
}

export interface JwtPayloadWithId extends JwtPayload {
  id: number;
}

export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

export interface OpenSkyResponse {
  time: number;
  states: OpenSkyState[] | null;
}

export interface FlightData {
  icao24: string;
  callsign: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  velocity: number | null;
  on_ground: boolean;
  last_contact: number;
}
