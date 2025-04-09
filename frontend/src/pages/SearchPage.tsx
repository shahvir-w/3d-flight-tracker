import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import SavedModal from '../components/SavedModal';
import { getSavedFlights } from '../utils/savedFlights';
import styles from '../App.module.css';

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

function SearchPage() {
  const [error, setError] = useState<string | null>(null);
  const [savedFlights, setSavedFlights] = useState<SavedFlight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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

      // Navigate to flight details page with the flight data
      navigate('/flight', { state: { flightData: data } });
    } catch (err: any) {
      console.error('Error fetching flight data:', err);
      const errorMessage = err.response?.data?.message || 'Invalid flight number';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const savedClicked = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
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

      <SavedModal
        isOpen={isModalOpen}
        onClose={closeModal}
        savedFlights={savedFlights}
        fetchFlightData={fetchFlightData}
      />
    </div>
  );
}

export default SearchPage; 