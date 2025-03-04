import { parsedFlight } from "../types/parsedFlight";
import { FlightsData } from "../types/AreoAPI";
import { calculateFlightTimes, convertToEasternTime, convertToEasternDate } from "./timeCalculations";
import getGeoLocationData from "../utils/getGeoLocation";

export const parseFlightData = async (flightData: any): Promise<{
  targetFlight: parsedFlight | null,
  twoUpcomingFlights: parsedFlight[],
  twoPreviousFlights: parsedFlight[]
}> => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));

  // sort flights based on date ascending
  const sortedFlights = flightData.flights.sort(
    (a: any, b: any) => new Date(a.scheduled_out).getTime() - new Date(b.scheduled_out).getTime()
  );

  // seperate flights
  let targetFlight: parsedFlight | null = null;
  let previousFlights: parsedFlight[] = [];
  let upcomingFlights: parsedFlight[] = [];

  for (let i = 0; i < sortedFlights.length; i++) {
    const flight = sortedFlights[i];

    const simplifiedFlight: parsedFlight = {
      ident: flight.ident,
      fa_flight_id: flight.fa_flight_id,
      departure_city: {
        airport_code: flight.origin.code_iata,
        airport_name: flight.origin.name + " Airport",
      },
      arrival_city: {
        airport_code: flight.destination.code_iata,
        airport_name: flight.destination.name + " Airport",
      },
      departure_date: flight.scheduled_out ? convertToEasternDate(flight.scheduled_out) : convertToEasternDate(flight.scheduled_off),
      arrival_date: flight.scheduled_in ? convertToEasternDate(flight.scheduled_in) : convertToEasternDate(flight.scheduled_on),
      scheduled_out: flight.scheduled_out ? convertToEasternTime(flight.scheduled_out) : convertToEasternTime(flight.scheduled_off),
      estimated_out: flight.estimated_out ? convertToEasternTime(flight.estimated_out) : convertToEasternTime(flight.estimated_off),
      actual_out: flight.actual_out ? convertToEasternTime(flight.actual_out) : convertToEasternTime(flight.actual_off),
      scheduled_in: flight.scheduled_in ? convertToEasternTime(flight.scheduled_in) : convertToEasternTime(flight.scheduled_on),
      estimated_in: flight.estimated_in ? convertToEasternTime(flight.estimated_in) : convertToEasternTime(flight.estimated_on),
      actual_in: flight.actual_in ? convertToEasternTime(flight.actual_in) : convertToEasternTime(flight.actual_on),
      progress_percent: flight.progress_percent,
      status: flight.status,
      route_distance: Math.round(flight.route_distance * 1.60934),
      origin_gate: flight.gate_origin,
      origin_terminal: flight.terminal_origin,
      destination_gate: flight.gate_destination,
      destination_terminal: flight.terminal_destination,
      aircraft_type: flight.aircraft_type,
    };

    const scheduledOut = flight.scheduled_out? new Date(flight.scheduled_out) : new Date(flight.scheduled_off);
    const scheduledIn = flight.scheduled_in? new Date(flight.scheduled_in) : new Date(flight.scheduled_on);
    const threeHoursAfterLanding = new Date(scheduledIn);
    threeHoursAfterLanding.setHours(threeHoursAfterLanding.getHours() + 3);
    
    const isInProgress = flight.progress_percent && flight.progress_percent > 0 && flight.progress_percent < 100;
    const isUpcoming = scheduledOut > now;
    const isRecentlyLanded = now < threeHoursAfterLanding;

    if (!targetFlight) {
      if (isInProgress || isUpcoming || isRecentlyLanded) {
        targetFlight = simplifiedFlight;
      } else {
        previousFlights.push(simplifiedFlight);
      }
    } else {
      upcomingFlights.push(simplifiedFlight);
    }
    }

    // If no upcoming or in-progress flight was found, pick the last departed flight
    if (!targetFlight && previousFlights.length > 0) {
      targetFlight = previousFlights.pop()!; // Get the most recent past flight
    }

  // get two of the closest flights to targetFlight by date
  const twoUpcomingFlights = upcomingFlights.slice(0, 2);
  const twoPreviousFlights = previousFlights.reverse().slice(0, 2);

  const { timeElapsed, timeRemaining, totalTime } = calculateFlightTimes(targetFlight, now);

  // determine remaining distance
  const percentFlightCompletion: number = targetFlight?.progress_percent ? targetFlight.progress_percent / 100 : 0;
  const routeDistance: number = targetFlight?.route_distance ? targetFlight?.route_distance : 0;
  const distanceRemaining: number = Math.round(routeDistance * (1 - percentFlightCompletion));

  const calculatedData = {
    timeElapsed,
    timeRemaining,
    totalTime,
    distanceRemaining
  };

  // Add data to targetFlight
  if (targetFlight) {
    targetFlight = { ...targetFlight, ...calculatedData };
  }

  // get airports location info
  if (targetFlight) {
    const departure_coordinates = await getGeoLocationData(targetFlight.departure_city.airport_name);
    const arrival_coordinates = await getGeoLocationData(targetFlight.arrival_city.airport_name);
    targetFlight.departure_city = {
      ...targetFlight.departure_city,
      ...departure_coordinates
    }
    targetFlight.arrival_city = {
      ...targetFlight.arrival_city,
      ...arrival_coordinates
    }
    
  }

  return { targetFlight, twoUpcomingFlights, twoPreviousFlights };
};

export const parseFlightPositionData = (flightPositionData: any, targetFlight: parsedFlight): { updatedTargetFlight: parsedFlight | null } => {
  const lastPosition = flightPositionData.last_position ? flightPositionData.last_position : null;

  // Extract position data from flight position API
  const positionData = {
    time_now: new Date(),
    latitude: lastPosition.latitude,
    longitude: lastPosition.longitude,
    altitude: Math.round(lastPosition.altitude * 100 * 0.3048),
    groundSpeed: Math.round(lastPosition.groundspeed * 1.60934),
    heading: lastPosition.heading
  };

  const waypoints = flightPositionData.waypoints;
  const waypointCoordinates = [];
  for (let i = 0; i < waypoints.length; i += 2) {
    waypointCoordinates.push([waypoints[i + 1], waypoints[i]]);
  }

  // Combine position data with existing targetFlight data
  const updatedTargetFlight = {
    ...targetFlight,
    ...positionData,
    waypoints: waypointCoordinates
  };

  return { updatedTargetFlight };
};
