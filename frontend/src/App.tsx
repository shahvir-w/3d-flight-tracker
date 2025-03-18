import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Globe from './components/Globe';
import FlightDetails from './components/FlightDetails';
import SavedModal from './components/SavedModal';
import 'semantic-ui-css/semantic.min.css';
import styles from './App.module.css';
import SearchBar from './components/SearchBar';
import { MdOutlineStarOutline, MdOutlineStar  } from "react-icons/md"; 
import { getSavedFlights, addSavedFlight, deleteSavedFlight, isFlightSaved } from './utils/savedFlights';

type SavedFlight = {
  flightNumber: string;
  departureCity: {
    airport_code: string;
    airport_name: string;
  };
  arrivalCity: {
    airport_code: string;
    airport_name: string;
  };
};

const isValidFlightNumber = (flightNum: string): boolean => {
  const flightNumberRegex = /^[A-Z]{2,3}\d{1,4}[A-Z]?$/;
  return flightNumberRegex.test(flightNum);
};

function App() {
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [starred, setStarred] = useState<boolean>(false);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Load saved flights from localStorage on component mount
  useEffect(() => {
    setSavedFlights(getSavedFlights());
  }, []);

  const fetchFlightData = async (flightNum: string) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!isValidFlightNumber(flightNum)) {
        setError('Invalid flight number');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/flights/${flightNum}`);
      const data = response.data;

      if (!data.updatedTargetFlight) {
        setError('Error processing your request at this time');
        setIsLoading(false);
        return;
      }
      
      // Check if the flight is saved
      if (data.updatedTargetFlight && data.updatedTargetFlight.ident) {
        setStarred(isFlightSaved(data.updatedTargetFlight.ident));
      }

      setFlightData(data);
      setError(null);
      console.log('Fetched flight data:', data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching flight data:', err);
      const errorMessage = err.response?.data?.message || 'Invalid flight number';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const starClicked = () => {
    if (!flightData?.updatedTargetFlight) return;

    const flightNumber = flightData.updatedTargetFlight.ident;
    const departureCityData = flightData.updatedTargetFlight.departure_city;
    const arrivalCityData = flightData.updatedTargetFlight.arrival_city;

    if (!starred) {
      // Add to saved flights
      addSavedFlight(flightNumber, departureCityData, arrivalCityData);
      setStarred(true);
    } else {
      // Remove from saved flights
      deleteSavedFlight(flightNumber);
      setStarred(false);
    }

    // Update saved flights state
    setSavedFlights(getSavedFlights());
  };

  const savedClicked = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.appContainer}>
      {!flightData ? (
        <div className={styles.centeredContainer}>
          <div className={styles.landingContent}>
            <div className={styles.logoContainer}>
              <h1 className={styles.landingTitle}>3D Flight Tracker</h1>
            </div>
            <p className={styles.landingDescription}>
              Enter a flight number to track real-time flight data
            </p>
            <div className={styles.searchContainerLanding}>
              <SearchBar onSearch={fetchFlightData} isLoading={isLoading} />
              <button onClick={savedClicked} className={styles.savedButton}>Saved</button>
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.exampleText}>
              Examples: UA2402, DL1234, BA142
            </div>
          </div>
        </div>
      ) : (
        <>
          {isMobile ? (
            // Mobile layout: Globe on top, Flight Details below
            <>
              <div className={styles.searchContainer} style={{ width: '100%', padding: '15px' }}>
                <button onClick={starClicked} className={styles.starButton}>
                  {starred ? <MdOutlineStar className={styles.starIcon}/> : <MdOutlineStarOutline className={styles.starIcon}/>}
                </button> 
                <SearchBar onSearch={fetchFlightData} isLoading={isLoading} />
                <button onClick={savedClicked} className={styles.savedButton}>Saved</button>
              </div>
              
              {/* Globe takes full width on mobile */}
              <Globe flightData={flightData} />
              
              {/* Flight details below the globe */}
              <div className={styles.leftColumn}>
                <FlightDetails flightData={flightData} />
              </div>
            </>
          ) : (
            // Desktop layout: Flight Details on left, Globe on right
            <>
              <div className={styles.leftColumn}>
                <div className={styles.searchContainer} style={{ width: '100%' }}>
                  <button onClick={starClicked} className={styles.starButton}>
                    {starred ? <MdOutlineStar className={styles.starIcon}/> : <MdOutlineStarOutline className={styles.starIcon}/>}
                  </button> 
                  <SearchBar onSearch={fetchFlightData} isLoading={isLoading} />
                  <button onClick={savedClicked} className={styles.savedButton}>Saved</button>
                </div>
                <FlightDetails flightData={flightData} />
              </div>

              <Globe flightData={flightData} />
            </>
          )}
        </>
      )}

      <SavedModal
        isOpen={isModalOpen}
        onClose={closeModal}
        savedFlights={savedFlights}
        fetchFlightData={fetchFlightData}
      />
    </div>
  );
}

export default App;
