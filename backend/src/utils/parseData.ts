import { parsedFlight } from "../types/parsedFlight";
import { FlightsData } from "../types/AreoAPI";
import { calculateFlightTimes, convertToEasternDateTime } from "./timeCalculations";
import getGeoLocationData from "../utils/getGeoLocation";

export const parseFlightData = async (flightData: any): Promise<{
  targetFlight: parsedFlight | null,
  twoUpcomingFlights: parsedFlight[],
  twoPreviousFlights: parsedFlight[]
}> => {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));

  // We'll categorize flights by priority
  let inProgressFlights: Array<{ flight: any, simplified: parsedFlight }> = [];
  let upcomingSoonFlights: Array<{ flight: any, simplified: parsedFlight }> = [];
  let recentlyLandedFlights: Array<{ flight: any, simplified: parsedFlight }> = [];
  let otherUpcomingFlights: Array<{ flight: any, simplified: parsedFlight }> = [];
  let previousFlights: Array<{ flight: any, simplified: parsedFlight }> = [];

  // sort flights based on date in descending order (newest to oldest)
  const sortedFlights = flightData.flights.sort(
    (a: any, b: any) => new Date(b.scheduled_out || b.scheduled_off || 0).getTime() - new Date(a.scheduled_out || a.scheduled_off || 0).getTime()
  );

  console.log(`Processing ${sortedFlights.length} flights for ${sortedFlights[0]?.ident || 'unknown'}`);
  
  // Process and categorize all flights
  for (let i = 0; i < sortedFlights.length; i++) {
    try {
      const flight = sortedFlights[i];
      
      // Skip flights with null destination or cancelled flights
      if (!flight.origin || !flight.destination || flight.cancelled) {
        continue;
      }
      
      // Skip position-only flights
      if (flight.position_only) {
        continue;
      }

      const originCode = flight.origin?.code_iata ?? flight.origin?.code_icao ?? "N/A";
      const originName = flight.origin?.name ?? "Unknown Airport";
      const destinationCode = flight.destination?.code_iata ?? flight.destination?.code_icao ?? "N/A";
      const destinationName = flight.destination?.name ?? "Unknown Airport";

      const simplifiedFlight: parsedFlight = {
        ident: flight.ident,
        fa_flight_id: flight.fa_flight_id,
        departure_city: {
          airport_code: originCode,
          airport_name: originName + " Airport",
        },
        arrival_city: {
          airport_code: destinationCode,
          airport_name: destinationName + " Airport",
        },
        departure_date: convertToEasternDateTime(flight.scheduled_out ? flight.scheduled_out : flight.scheduled_off),
        arrival_date: convertToEasternDateTime(flight.scheduled_in ? flight.scheduled_in : flight.scheduled_on),
        scheduled_out: convertToEasternDateTime(flight.scheduled_out ? flight.scheduled_out : flight.scheduled_off),
        estimated_out: convertToEasternDateTime(flight.estimated_out ? flight.estimated_out : flight.estimated_off),
        actual_out: convertToEasternDateTime(flight.actual_out ? flight.actual_out : flight.actual_off),
        scheduled_in: convertToEasternDateTime(flight.scheduled_in ? flight.scheduled_in : flight.scheduled_on),
        estimated_in: convertToEasternDateTime(flight.estimated_in ? flight.estimated_in : flight.estimated_on),
        actual_in: convertToEasternDateTime(flight.actual_in ? flight.actual_in : flight.actual_on),
        progress_percent: flight.progress_percent ?? 0,
        status: flight.status ?? "Unknown",
        route_distance: Math.round((flight.route_distance ?? 0) * 1.60934),
        origin_gate: flight.gate_origin,
        origin_terminal: flight.terminal_origin,
        destination_gate: flight.gate_destination,
        destination_terminal: flight.terminal_destination,
        aircraft_type: flight.aircraft_type ?? "Unknown",
      };

      const scheduledOut = flight.scheduled_out ? new Date(flight.scheduled_out) : 
                          flight.scheduled_off ? new Date(flight.scheduled_off) : 
                          null;
      
      const scheduledIn = flight.scheduled_in ? new Date(flight.scheduled_in) : 
                         flight.scheduled_on ? new Date(flight.scheduled_on) : 
                         null;
      
      if (!scheduledOut || !scheduledIn) {
        continue; // Skip flights with no scheduled times
      }

      // Define time windows for priorities
      const SIX_HOURS_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      
      // Get actual departure and arrival times
      const actualOut = flight.actual_out ? new Date(flight.actual_out) : 
                        flight.actual_off ? new Date(flight.actual_off) : null;
      
      const actualIn = flight.actual_in ? new Date(flight.actual_in) : 
                       flight.actual_on ? new Date(flight.actual_on) : null;
      
      // Get estimated arrival time
      const estimatedIn = flight.estimated_in ? new Date(flight.estimated_in) : 
                          flight.estimated_on ? new Date(flight.estimated_on) : null;
      
      // Check if it's a current in-progress flight using multiple methods
      let isInProgress = false;
      
      // Method 1: Check if status contains keywords indicating flight is in air
      if (flight.status && 
          (flight.status.toLowerCase().includes('in air') || 
           flight.status.toLowerCase().includes('en route') ||
           flight.status.toLowerCase().includes('departing') ||
           flight.status.toLowerCase().includes('departed'))) {
        isInProgress = true;
        console.log(`Flight ${flight.ident} is in-progress based on status: ${flight.status}`);
      }
      // Method 2: Progress between 0-100 (but be careful of 100% that are still flying)
      else if (flight.progress_percent !== undefined && 
               flight.progress_percent > 0 && 
               (flight.progress_percent < 100 || (flight.progress_percent === 100 && !actualIn))) {
        isInProgress = true;
        console.log(`Flight ${flight.ident} is in-progress based on progress: ${flight.progress_percent}%`);
      }
      // Method 3: Actual departure exists but no actual arrival
      else if (actualOut && !actualIn) {
        // If there's an estimated arrival time in the future, it's definitely in-progress
        if (estimatedIn && estimatedIn > now) {
          isInProgress = true;
          console.log(`Flight ${flight.ident} is in-progress based on actual departure at ${actualOut.toISOString()} with future estimated arrival`);
        } else {
          // Otherwise, check if the scheduled arrival is in the future or within the last hour
          const ONE_HOUR_MS = 60 * 60 * 1000;
          if (scheduledIn && 
              (scheduledIn > now || now.getTime() - scheduledIn.getTime() < ONE_HOUR_MS)) {
            isInProgress = true;
            console.log(`Flight ${flight.ident} is in-progress based on actual departure at ${actualOut.toISOString()} with recent scheduled arrival`);
          }
        }
      }
      
      // Check if scheduled dates are within reasonable timeframe
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
      
      // Skip very old flights (more than 2 days in the past)
      if (!isInProgress && scheduledIn && now.getTime() - scheduledIn.getTime() > TWO_DAYS_MS) {
        console.log(`Skipping old flight ${flight.ident} scheduled on ${scheduledOut.toISOString()}`);
        continue;
      }
      
      // Check if it's about to depart in the next 6 hours (and not already departed)
      const isUpcomingSoon = !isInProgress && 
                             !actualOut &&
                             scheduledOut > now && 
                             (scheduledOut.getTime() - now.getTime()) <= SIX_HOURS_MS;
      
      // Check if it recently landed within the last 6 hours
      const isRecentlyLanded = !isInProgress && 
                               actualIn && 
                               now > actualIn && 
                               (now.getTime() - actualIn.getTime()) <= SIX_HOURS_MS;
      
      // Is it a future flight beyond 6 hours?
      const isFutureFlight = !isInProgress && !isUpcomingSoon && scheduledOut > now;
      
      // Past flight
      const isPastFlight = !isInProgress && !isRecentlyLanded && 
                           ((actualIn && now > actualIn) || (scheduledIn && now > scheduledIn));
      
      // Categorize the flight
      if (isInProgress) {
        inProgressFlights.push({ flight, simplified: simplifiedFlight });
      } else if (isUpcomingSoon) {
        upcomingSoonFlights.push({ flight, simplified: simplifiedFlight });
      } else if (isRecentlyLanded) {
        recentlyLandedFlights.push({ flight, simplified: simplifiedFlight });
      } else if (isFutureFlight) {
        otherUpcomingFlights.push({ flight, simplified: simplifiedFlight });
      } else if (isPastFlight) {
        previousFlights.push({ flight, simplified: simplifiedFlight });
      }
    } catch (error) {
      console.error("Error processing flight:", error);
      continue; // Skip problematic flights
    }
  }

  console.log(`Found ${inProgressFlights.length} in-progress, ${upcomingSoonFlights.length} upcoming soon, ${recentlyLandedFlights.length} recently landed flights`);

  // Sort each category by relevance
  inProgressFlights.sort((a, b) => {
    // For in-progress flights, prefer those with progress < 100 first
    if (a.flight.progress_percent === 100 && b.flight.progress_percent < 100) return 1;
    if (a.flight.progress_percent < 100 && b.flight.progress_percent === 100) return -1;
    
    // Then sort by progress percentage (higher progress first)
    return (b.flight.progress_percent || 0) - (a.flight.progress_percent || 0);
  });
  
  upcomingSoonFlights.sort((a, b) => {
    const aTime = new Date(a.flight.scheduled_out || a.flight.scheduled_off).getTime();
    const bTime = new Date(b.flight.scheduled_out || b.flight.scheduled_off).getTime();
    return aTime - bTime; // Earliest first
  });
  
  recentlyLandedFlights.sort((a, b) => {
    const aTime = new Date(a.flight.actual_in || a.flight.actual_on).getTime();
    const bTime = new Date(b.flight.actual_in || b.flight.actual_on).getTime();
    return bTime - aTime; // Most recent first
  });
  
  // Sort previous flights by recency (newest first)
  previousFlights.sort((a, b) => {
    const aTime = new Date(a.flight.scheduled_out || a.flight.scheduled_off).getTime();
    const bTime = new Date(b.flight.scheduled_out || b.flight.scheduled_off).getTime();
    return bTime - aTime; // Most recent first
  });

  // Now select the target flight based on our priority rules
  let targetFlight: parsedFlight | null = null;
  let finalUpcomingFlights: parsedFlight[] = [];
  let finalPreviousFlights: parsedFlight[] = [];

  // Priority 1: In-progress flights
  if (inProgressFlights.length > 0) {
    console.log(`Selected in-progress flight: ${inProgressFlights[0].simplified.ident} with progress ${inProgressFlights[0].flight.progress_percent}%`);
    targetFlight = inProgressFlights[0].simplified;
    
    // Add remaining in-progress and upcoming flights to upcoming list
    finalUpcomingFlights = [
      ...inProgressFlights.slice(1).map(f => f.simplified),
      ...upcomingSoonFlights.map(f => f.simplified), 
      ...otherUpcomingFlights.map(f => f.simplified)
    ];
    
    // Add recently landed and past flights to previous list
    finalPreviousFlights = [
      ...recentlyLandedFlights.map(f => f.simplified),
      ...previousFlights.map(f => f.simplified)
    ];
  }
  // Priority 2: Upcoming soon flights
  else if (upcomingSoonFlights.length > 0) {
    console.log(`Selected upcoming soon flight: ${upcomingSoonFlights[0].simplified.ident}, departing in less than 6 hours`);
    targetFlight = upcomingSoonFlights[0].simplified;
    
    finalUpcomingFlights = [
      ...upcomingSoonFlights.slice(1).map(f => f.simplified),
      ...otherUpcomingFlights.map(f => f.simplified)
    ];
    
    finalPreviousFlights = [
      ...recentlyLandedFlights.map(f => f.simplified),
      ...previousFlights.map(f => f.simplified)
    ];
  }
  // Priority 3: Recently landed flights
  else if (recentlyLandedFlights.length > 0) {
    console.log(`Selected recently landed flight: ${recentlyLandedFlights[0].simplified.ident}, landed within 6 hours`);
    targetFlight = recentlyLandedFlights[0].simplified;
    
    finalUpcomingFlights = [
      ...otherUpcomingFlights.map(f => f.simplified)
    ];
    
    finalPreviousFlights = [
      ...recentlyLandedFlights.slice(1).map(f => f.simplified),
      ...previousFlights.map(f => f.simplified)
    ];
  }
  // Priority 4: Other upcoming flights
  else if (otherUpcomingFlights.length > 0) {
    console.log(`Selected future flight: ${otherUpcomingFlights[0].simplified.ident}, departing in more than 6 hours`);
    targetFlight = otherUpcomingFlights[0].simplified;
    
    finalUpcomingFlights = [
      ...otherUpcomingFlights.slice(1).map(f => f.simplified)
    ];
    
    finalPreviousFlights = [
      ...previousFlights.map(f => f.simplified)
    ];
  }
  // Priority 5: Past flights (most recent only)
  else if (previousFlights.length > 0) {
    // Get the most recent past flight (first in our sorted array)
    console.log(`No current/upcoming flights found. Selected most recent past flight: ${previousFlights[0].simplified.ident}`);
    targetFlight = previousFlights[0].simplified;
    
    finalPreviousFlights = previousFlights
      .slice(1) // Skip the one we selected as target
      .map(f => f.simplified);
  }

  // get two of the closest flights to targetFlight by date
  const twoUpcomingFlights = finalUpcomingFlights.slice(0, 2);
  const twoPreviousFlights = finalPreviousFlights.slice(0, 2);

  try {
    if (targetFlight) {
      const { timeElapsed, timeRemaining, totalTime } = calculateFlightTimes(targetFlight, now);

      // determine remaining distance
      const percentFlightCompletion: number = targetFlight.progress_percent ? targetFlight.progress_percent / 100 : 0;
      const routeDistance: number = targetFlight.route_distance ? targetFlight.route_distance : 0;
      const distanceRemaining: number = Math.round(routeDistance * (1 - percentFlightCompletion));

      const calculatedData = {
        timeElapsed,
        timeRemaining,
        totalTime,
        distanceRemaining
      };

      targetFlight = { ...targetFlight, ...calculatedData };

      // get airports location info
      try {
        const departure_coordinates = await getGeoLocationData(targetFlight.departure_city.airport_name);
        const arrival_coordinates = await getGeoLocationData(targetFlight.arrival_city.airport_name);
        
        targetFlight.departure_city = {
          ...targetFlight.departure_city,
          ...departure_coordinates
        };
        
        targetFlight.arrival_city = {
          ...targetFlight.arrival_city,
          ...arrival_coordinates
        };
      } catch (geoError) {
        console.error("Error fetching geo location data:", geoError);
        // Continue without geo data if there's an error
      }
    }
  } catch (calculationError) {
    console.error("Error calculating flight times or distances:", calculationError);
    // Return the basic flight data without calculations if there's an error
  }

  return { targetFlight, twoUpcomingFlights, twoPreviousFlights };
};

export const parseFlightPositionData = (flightPositionData: any, targetFlight: parsedFlight): { updatedTargetFlight: parsedFlight | null } => {
  try {
    if (!flightPositionData.last_position) {
      return { updatedTargetFlight: targetFlight };
    }
    
    const lastPosition = flightPositionData.last_position;

    // extract position data from flight position API
    const positionData = {
      time_now: new Date(),
      latitude: lastPosition.latitude,
      longitude: lastPosition.longitude,
      altitude: Math.round((lastPosition.altitude ?? 0) * 100 * 0.3048),
      groundSpeed: Math.round((lastPosition.groundspeed ?? 0) * 1.60934),
      heading: lastPosition.heading ?? 0
    };

    const waypoints = flightPositionData.waypoints ?? [];
    const waypointCoordinates = [];
    for (let i = 0; i < waypoints.length; i += 2) {
      if (i + 1 < waypoints.length) {
        waypointCoordinates.push([waypoints[i + 1], waypoints[i]]);
      }
    }

    // combine position data with existing targetFlight data
    const updatedTargetFlight = {
      ...targetFlight,
      ...positionData,
      waypoints: waypointCoordinates
    };

    return { updatedTargetFlight };
  } catch (error) {
    console.error("Error parsing flight position data:", error);
    return { updatedTargetFlight: targetFlight };
  }
};
