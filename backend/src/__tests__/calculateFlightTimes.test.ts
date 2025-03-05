import { calculateFlightTimes, convertToEasternDateTime } from '../utils/timeCalculations';

const mockFlight = (overrides = {}) => ({
  ident: "BAW92",
  fa_flight_id: "BAW92-1738651568-airline-1208p",
  departure_city: {
    airport_code: "YYZ",
    airport_name: "Toronto Pearson Int'l Airport",
  },
  arrival_city: {
    airport_code: "LHR",
    airport_name: "London Heathrow Airport",
  },
  departure_date: "2025-02-06T22:40:00Z",
  arrival_date: "2025-02-07T05:55:00Z",
  scheduled_out: "2025-02-06T22:40:00Z",
  estimated_out: "2025-02-06T22:40:00Z",
  actual_out: "2025-02-06T22:40:00Z",
  scheduled_in: "2025-02-07T05:13:00Z",
  estimated_in: "2025-02-07T05:29:00Z",
  actual_in: null,
  progress_percent: 81,
  status: "En Route / On Time",
  route_distance: Math.round(3600 * 1.60934),
  origin_gate: null,
  origin_terminal: "3",
  destination_gate: null, 
  destination_terminal: "5",
  aircraft_type: "B78X",
  ...overrides, // Applying overrides to mock flight data
});

describe('calculateFlightTimes', () => {
  const now = new Date('2025-02-06T23:40:00Z');

  test('returns null for all times if targetFlight is null', () => {
    expect(calculateFlightTimes(null, now)).toEqual({
      timeElapsed: null,
      timeRemaining: null,
      totalTime: null,
    });
  });

  test('calculates timeElapsed based on actual_out', () => {
    const flight = mockFlight({actual_out: "2025-02-06T21:40:00Z"});
    const result = calculateFlightTimes(flight, now);
    expect(result.timeElapsed).toBe('2h 00m');
  });

  test('calculates timeRemaining based on estimated_in', () => {
    const flight = mockFlight({estimated_in: "2025-02-07T07:29:00Z"});
    const result = calculateFlightTimes(flight, now);
    expect(result.timeRemaining).toBe('7h 49m');
  });

  test('calculates totalTime with actual_out and actual_in', () => {
    const flight = mockFlight({actual_out: "2025-02-06T22:40:00Z", actual_in:"2025-02-07T07:40:00Z"});
    const result = calculateFlightTimes(flight, now);
    expect(result.totalTime).toBe('9h 00m');
  });

  test('calculates totalTime with scheduled times if actual times are missing', () => {
    const flight = mockFlight();
    const result = calculateFlightTimes(flight, now);
    expect(result.totalTime).toBe('6h 49m');
  });
});

describe('convertToEasternDateTime', () => {
  test('converts UTC time to Eastern Date and Time', () => {

    expect(convertToEasternDateTime('2025-03-04T17:00:00Z')).toBe('2025-03-04T12:00:00Z');
  });

  test('returns empty string for null input', () => {
    expect(convertToEasternDateTime(null)).toBe('');
  });
});
