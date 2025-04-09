import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOutlineStarOutline, MdOutlineStar } from "react-icons/md";
import Globe from '../components/Globe';
import FlightDetails from '../components/FlightDetails';
import SearchBar from '../components/SearchBar';
import SavedModal from '../components/SavedModal';
import { getSavedFlights, addSavedFlight, deleteSavedFlight, isFlightSaved } from '../utils/savedFlights';
import styles from '../App.module.css';
import axios from 'axios';

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

function FlightDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flightData, setFlightData] = useState<any>(location.state?.flightData);
  const [starred, setStarred] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Load saved flights from localStorage on component mount
  useEffect(() => {
    setSavedFlights(getSavedFlights());
  }, []);

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

  // Check if the flight is saved when component mounts
  useEffect(() => {
    if (flightData?.updatedTargetFlight?.ident) {
      setStarred(isFlightSaved(flightData.updatedTargetFlight.ident));
    }
  }, [flightData]);

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

      setFlightData(data);
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
      addSavedFlight(flightNumber, departureCityData, arrivalCityData);
      setStarred(true);
    } else {
      deleteSavedFlight(flightNumber);
      setStarred(false);
    }
    setSavedFlights(getSavedFlights());
  };

  const savedClicked = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!flightData) {
    return (
      <div className={styles.centeredContainer}>
        <div className={styles.landingContent}>
          <h1 className={styles.landingTitle}>3D Flight Tracker</h1>
          <p className={styles.landingDescription}>No flight data available. Please search for a flight.</p>
          <button onClick={() => navigate('/')} className={styles.savedButton}>Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
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
          
          <Globe flightData={flightData} />
          
          <div className={styles.leftColumn}>
            {error && <div className={styles.errorMessage}>{error}</div>}
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
            {error && <div className={styles.errorMessage}>{error}</div>}
            <FlightDetails flightData={flightData} />
          </div>

          <Globe flightData={flightData} />
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

export default FlightDetailsPage; 