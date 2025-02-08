


type Flight = {
    ident: string;
    fa_flight_id: string;
    origin: {
        code_iata: string;
        name: string;
    };
    destination: {
        code_iata: string;
        name: string;
    };
    scheduled_out: string;
    estimated_out: string | null;
    actual_out: string | null;
    scheduled_in: string;
    estimated_in: string | null;
    actual_in: string | null;
    progress_percent: number;
    status: string;
};

type FlightsData = {
    flights: Flight[];
};

const getFlightData = (flightData: FlightsData): { 
    targetFlight: Flight | null, 
    upcomingFlights: Flight[], 
    previousFlights: Flight[] 
  } => {
    const now = new Date();
  
    // Sort flights by scheduled departure time
    const sortedFlights = flightData.flights.sort(
      (a, b) => new Date(a.scheduled_out).getTime() - new Date(b.scheduled_out).getTime()
    );
  
    // Find the target flight
    let targetFlight: Flight | null = null;
    let previousFlights: Flight[] = [];
    let upcomingFlights: Flight[] = [];
  
    for (let i = 0; i < sortedFlights.length; i++) {
      const flight = sortedFlights[i];
      const scheduledOut = new Date(flight.scheduled_out);
      const scheduledIn = new Date(flight.scheduled_in);
  
      const threeHoursAfterLanding = new Date(scheduledIn);
      threeHoursAfterLanding.setHours(threeHoursAfterLanding.getHours() + 3);
  
      // Determine if this is the target flight (either en route, landed within 3 hours, or next departure)
      if (!targetFlight && (scheduledOut > now || now < threeHoursAfterLanding)) {
        targetFlight = flight;
      } else if (targetFlight) {
        upcomingFlights.push(flight);
      } else {
        previousFlights.push(flight);
      }
    }
  
    return { targetFlight, upcomingFlights, previousFlights };
  };