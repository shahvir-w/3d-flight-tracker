import { useEffect, useState } from 'react';
import axios from 'axios';
import Globe from './components/Globe';
import FlightDetails from './components/FlightDetails';
import SavedModal from './components/SavedModal';
import 'semantic-ui-css/semantic.min.css';
import styles from './App.module.css';
import SearchBar from './components/SearchBar';
import { MdOutlineStarOutline, MdOutlineStar  } from "react-icons/md"; 


type savedFlight = {
  flightNumber: string;
  departureCity: any;
  arrivalCity: any;
};

const isValidFlightNumber = (flightNum: string): boolean => {
  const flightNumberRegex = /^[A-Z]{2,3}\d{1,4}[A-Z]?$/;
  return flightNumberRegex.test(flightNum);
};

function App() {
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [starred, setStarred] = useState<boolean>(false);
  const [savedFlights, setSavedFlights] = useState<savedFlight[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSavedFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/saved/flights', {
        withCredentials: true,
      });
      console.log(response.data); 
      setSavedFlights(response.data);
    } catch (err) {
      console.error('Error fetching saved flights:', err);
    }
  };

  const fetchFlightData = async (flightNum: string) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!isValidFlightNumber(flightNum)) {
        setError('Invalid flight number');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/${flightNum}`);
      console.log(response)
      const data = response.data;

      if (!data.updatedTargetFlight) {
        setError('Error processing your request at this time');
        setIsLoading(false);
        return;
      }
      
      if (data.updatedTargetFlight && data.updatedTargetFlight.ident) {
        if (savedFlights.some(flight => flight.flightNumber === data.updatedTargetFlight.ident)) {
          setStarred(true); // Set starred to true if the flight is saved
        } else {
          setStarred(false); // Set starred to false if the flight is not saved
        }
      }

      setFlightData(data);
      setError(null); // Clear any previous error
      console.log('Fetched flight data:', data);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching flight data:', err);
      const errorMessage = err.response?.data?.message || 'Invalid flight number';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const starClicked = async () => {
    setStarred(!starred)
    if (!starred) {
      try {
        await axios.post(
          `http://localhost:5000/api/saved/flights`, 
          {
            flightNumber: flightData.updatedTargetFlight.ident,
            departureCityData: flightData.updatedTargetFlight.departure_city,
            arrivalCityData: flightData.updatedTargetFlight.arrival_city,
          },
          { withCredentials: true }
        );

        fetchSavedFlights();
      } catch (err) {
        console.error('Error adding a saved flights:', err);
      }
    }
    
    else if (starred) {
      try {
        await axios.delete(
          `http://localhost:5000/api/saved/flights`, 
          {
            data: {
              flightNumber: flightData.updatedTargetFlight.ident,  // Use 'data' to send the body
            },
            withCredentials: true,
          }
        );
    
        fetchSavedFlights();
      } catch (err) {
        console.error('Error deleting saved flight:', err);
      }
    }    
  }

  const savedClicked = async () => {
    setIsModalOpen(true);
  } 

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  useEffect(() => {
    fetchSavedFlights();
  }, []);


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
          <div className={styles.leftColumn}>
            <div className={styles.searchContainer} style={{ width: '90%' }}>
              <button onClick={starClicked} className={styles.starButton}>
                {starred ? <MdOutlineStar className={styles.starIcon}/> : <MdOutlineStarOutline className={styles.starIcon}/>}
              </button> 
              <SearchBar onSearch={fetchFlightData} isLoading={isLoading} />
              <button onClick={savedClicked} className={styles.savedButton}>Saved</button>
            </div>
            <FlightDetails flightData={flightData} />
          </div>

          <Globe flightData={flightData}/>
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
