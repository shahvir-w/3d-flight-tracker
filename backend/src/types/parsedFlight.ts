export type parsedFlight = {
    ident: string;
    fa_flight_id: string;
    departure_city: {
      airport_code: string;
      airport_name: string;
    };
    arrival_city: {
      airport_code: string;
      airport_name: string;
    };
    departure_date: string;
    arrival_date: string;
    scheduled_out: string;
    estimated_out?: string | null;
    actual_out?: string | null;
    scheduled_in: string;
    estimated_in?: string | null;
    actual_in?: string | null;
    progress_percent?: number;
    status: string;
    route_distance?: number;
    origin_gate: string | null;
    origin_terminal: string | null;
    destination_gate: string | null;
    destination_terminal: string | null;
    aircraft_type: string;
};
