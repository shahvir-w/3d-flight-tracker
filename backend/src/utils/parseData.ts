import { parsedFlight } from "../models/parsedFlight.model";
import { FlightsData } from "../models/AreoAPI";

export const parseFlightData = (flightData: FlightsData): {
  targetFlight: parsedFlight | null,
  twoUpcomingFlights: parsedFlight[],
  twoPreviousFlights: parsedFlight[]
} => {
  const now = new Date();

  // sort flights based on date ascending
  const sortedFlights = flightData.flights.sort(
    (a, b) => new Date(a.scheduled_out).getTime() - new Date(b.scheduled_out).getTime()
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
        airport_name: flight.origin.name,
      },
      arrival_city: {
        airport_code: flight.destination.code_iata,
        airport_name: flight.destination.name,
      },
      scheduled_out: flight.scheduled_out,
      estimated_out: flight.estimated_out,
      actual_out: flight.actual_out,
      scheduled_in: flight.scheduled_in,
      estimated_in: flight.estimated_in,
      actual_in: flight.actual_in,
      progress_percent: flight.progress_percent,
      status: flight.status,
      route_distance: flight.route_distance,
      origin_gate: flight.gate_origin,
      origin_terminal: flight.terminal_origin,
      destination_gate: flight.gate_destination,
      destination_terminal: flight.terminal_destination,
      aircraft_type: flight.aircraft_type,
    };

    const scheduledOut = new Date(flight.scheduled_out);
    const scheduledIn = new Date(flight.scheduled_in);
    const threeHoursAfterLanding = new Date(scheduledIn);
    threeHoursAfterLanding.setHours(threeHoursAfterLanding.getHours() + 3);
    
    if (!targetFlight && ((flight.progress_percent && flight.progress_percent > 0 && flight.progress_percent < 100) || scheduledOut > now || now < threeHoursAfterLanding)) {
      targetFlight = simplifiedFlight;
    } else if (targetFlight) {
      upcomingFlights.push(simplifiedFlight);
    } else {
      previousFlights.push(simplifiedFlight);
    }
  }

  // get two of the closest flights to targetFlight by date
  let twoUpcomingFlights: parsedFlight[] = [];
  let twoPreviousFlights: parsedFlight[] = [];
  previousFlights.reverse();

  for (let i = 0; i < 2; i++) {
    twoUpcomingFlights[i] = upcomingFlights[i];
    twoPreviousFlights[i] = previousFlights[i];
  }


  // determine timeElapsed, timeRemaining, totalTime, and distanceRemaining
  const actualOut = targetFlight?.actual_out ? new Date(targetFlight.actual_out) : null;
  const scheduledIn = targetFlight?.scheduled_in ? new Date(targetFlight.scheduled_in) : null;
  const scheduledOut = targetFlight?.scheduled_out ? new Date(targetFlight.scheduled_out) : null;

  const timeElapsed = actualOut ? Math.max(0, (now.getTime() - actualOut.getTime()) / 1000 / 60) : null;
  const timeRemaining = scheduledIn ? Math.max(0, (scheduledIn.getTime() - now.getTime()) / 1000 / 60) : null;

  const totalTimeInMilliseconds = scheduledIn && scheduledOut ? scheduledIn.getTime() - scheduledOut.getTime() : null;
  const totalTimeInMinutes = totalTimeInMilliseconds ? totalTimeInMilliseconds / (1000 * 60) : null;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins < 10 ? '0' + mins : mins}m`;
  };

  const formattedTimeElapsed = timeElapsed !== null ? formatTime(timeElapsed) : null;
  const formattedTimeRemaining = timeRemaining !== null ? formatTime(timeRemaining) : null;
  const formattedTimeTotal = totalTimeInMinutes !== null ? formatTime(totalTimeInMinutes) : null;


  const percentFlightCompletion: number = targetFlight?.progress_percent ? targetFlight.progress_percent / 100 : 0;
  const routeDistance: number = targetFlight?.route_distance ?? 0;
  const distanceRemaining: number = Math.round(routeDistance * (1 - percentFlightCompletion));

  const calculatedData = {
    timeElapsed: formattedTimeElapsed,
    timeRemaining: formattedTimeRemaining,
    totalTime: formattedTimeTotal,
    distanceRemaining: distanceRemaining
  };

  // add data to targetFlight
  if (targetFlight) {
    targetFlight = {
      ...targetFlight,
      ...calculatedData,
    };
  }

  return { targetFlight, twoUpcomingFlights, twoPreviousFlights };
};

export const parseFlightPositionData = (flightPositionData: any, targetFlight: parsedFlight): { updatedTargetFlight: parsedFlight | null } => {
  const lastPosition = flightPositionData?.last_position;

  if (!lastPosition) {
    return { updatedTargetFlight: null };
  }

  // Extract position data from flight position API
  const positionData = {
    time_now: new Date(),
    latitude: lastPosition.latitude,
    longitude: lastPosition.longitude,
    altitude: lastPosition.altitude,
    groundSpeed: lastPosition.groundspeed,
  };

  // Combine position data with existing targetFlight data
  const updatedTargetFlight = {
    ...targetFlight,
    ...positionData,
  };

  return { updatedTargetFlight };
};
