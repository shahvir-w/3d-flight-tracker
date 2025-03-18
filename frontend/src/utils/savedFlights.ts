interface SavedFlight {
  flightNumber: string;
  departureCity: {
    airport_code: string;
    airport_name: string;
  };
  arrivalCity: {
    airport_code: string;
    airport_name: string;
  };
}

const SAVED_FLIGHTS_KEY = 'savedFlights';

// Get all saved flights
export const getSavedFlights = (): SavedFlight[] => {
  try {
    const savedFlights = localStorage.getItem(SAVED_FLIGHTS_KEY);
    return savedFlights ? JSON.parse(savedFlights) : [];
  } catch (error) {
    console.error('Error getting saved flights:', error);
    return [];
  }
};

// Add a new saved flight
export const addSavedFlight = (flightNumber: string, departureCityData: any, arrivalCityData: any): void => {
  try {
    const savedFlights = getSavedFlights();
    
    // Check if flight already exists
    if (savedFlights.some(flight => flight.flightNumber === flightNumber)) {
      return; // Flight already saved
    }

    const newFlight: SavedFlight = {
      flightNumber,
      departureCity: {
        airport_code: departureCityData.airport_code,
        airport_name: departureCityData.airport_name,
      },
      arrivalCity: {
        airport_code: arrivalCityData.airport_code,
        airport_name: arrivalCityData.airport_name,
      },
    };

    savedFlights.push(newFlight);
    localStorage.setItem(SAVED_FLIGHTS_KEY, JSON.stringify(savedFlights));
  } catch (error) {
    console.error('Error adding saved flight:', error);
  }
};

// Delete a saved flight
export const deleteSavedFlight = (flightNumber: string): void => {
  try {
    const savedFlights = getSavedFlights();
    const updatedFlights = savedFlights.filter(flight => flight.flightNumber !== flightNumber);
    localStorage.setItem(SAVED_FLIGHTS_KEY, JSON.stringify(updatedFlights));
  } catch (error) {
    console.error('Error deleting saved flight:', error);
  }
};

// Check if a flight is saved
export const isFlightSaved = (flightNumber: string): boolean => {
  try {
    const savedFlights = getSavedFlights();
    return savedFlights.some(flight => flight.flightNumber === flightNumber);
  } catch (error) {
    console.error('Error checking if flight is saved:', error);
    return false;
  }
}; 