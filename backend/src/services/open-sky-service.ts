import { FlightData, OpenSkyResponse } from "../types/general-interfaces";
import logger from "../utils/logger";

class OpenSkyService {
  private readonly BASE_URL = process.env.OPEN_SKY_API_BASE_URL;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = Number(
    process.env.MIN_REQUEST_INTERVAL
  );

  /**
   * Get all flights in a bounding box
   * @param lamin - Minimum latitude (default: Sofia area)
   * @param lomin - Minimum longitude
   * @param lamax - Maximum latitude
   * @param lomax - Maximum longitude
   */
  async getFlightsInArea(
    lamin: number = 42.0,
    lomin: number = 23.0,
    lamax: number = 43.5,
    lomax: number = 25.0
  ): Promise<FlightData[]> {
    try {
      // rate limiting check
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        logger.warn(`Rate limit: waiting ${waitTime}ms before next request`);
        await this.sleep(waitTime);
      }

      const url = `${this.BASE_URL}/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

      logger.info(`Fetching flights from OpenSky API: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "FlightOpsSystem",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          logger.error("OpenSky API rate limit exceeded");
          throw new Error(
            "Too many requests to OpenSky API. Please try again later."
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.lastRequestTime = Date.now();

      const data: OpenSkyResponse = await response.json();

      if (!data.states || data.states.length === 0) {
        logger.info("No flights found in the specified area");
        return [];
      }

      // format OpenSky data
      const flights: FlightData[] = data.states
        .filter((state) => state.latitude !== null && state.longitude !== null)
        .map((state) => ({
          icao24: state.icao24.trim(),
          callsign: state.callsign ? state.callsign.trim() : null,
          latitude: state.latitude,
          longitude: state.longitude,
          altitude: state.baro_altitude,
          velocity: state.velocity,
          on_ground: state.on_ground,
          last_contact: state.last_contact,
        }));

      logger.info(`Retrieved ${flights.length} flights from OpenSky API`);
      return flights;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          logger.error("OpenSky API request timeout");
          throw new Error("Request to OpenSky API timed out");
        }
        logger.error(`OpenSky API error: ${error.message}`);
      } else {
        logger.error("Unexpected error fetching flights:", error);
      }
      throw error;
    }
  }

  /**
   * Get flight by ICAO24 address
   */
  async getFlightByIcao24(icao24: string): Promise<FlightData | null> {
    try {
      const url = `${this.BASE_URL}/states/all?icao24=${icao24}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(`Failed to fetch flight ${icao24}: ${response.status}`);
        return null;
      }

      const data: OpenSkyResponse = await response.json();

      if (!data.states || data.states.length === 0) {
        return null;
      }

      const state = data.states[0];
      return {
        icao24: state.icao24.trim(),
        callsign: state.callsign ? state.callsign.trim() : null,
        latitude: state.latitude,
        longitude: state.longitude,
        altitude: state.baro_altitude,
        velocity: state.velocity,
        on_ground: state.on_ground,
        last_contact: state.last_contact,
      };
    } catch (error) {
      logger.error(`Error fetching flight ${icao24}:`, error);
      return null;
    }
  }

  /**
   * Get flights by multiple ICAO24 addresses
   */
  async getFlightsByIcao24List(icao24List: string[]): Promise<FlightData[]> {
    try {
      const icao24Params = icao24List.map((icao) => `icao24=${icao}`).join("&");
      const url = `${this.BASE_URL}/states/all?${icao24Params}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(`Failed to fetch flights: ${response.status}`);
        return [];
      }

      const data: OpenSkyResponse = await response.json();

      if (!data.states || data.states.length === 0) {
        return [];
      }

      return data.states
        .filter((state) => state.latitude !== null && state.longitude !== null)
        .map((state) => ({
          icao24: state.icao24.trim(),
          callsign: state.callsign ? state.callsign.trim() : null,
          latitude: state.latitude,
          longitude: state.longitude,
          altitude: state.baro_altitude,
          velocity: state.velocity,
          on_ground: state.on_ground,
          last_contact: state.last_contact,
        }));
    } catch (error) {
      logger.error("Error fetching flights by ICAO24 list:", error);
      return [];
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const openSkyService = new OpenSkyService();

export default openSkyService;
