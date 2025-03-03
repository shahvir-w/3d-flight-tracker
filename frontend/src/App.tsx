import { useEffect, useState } from 'react';
import axios from 'axios';
import Globe from './components/Globe';
import FlightDetails from './components/FlightDetails';
import SavedModal from './components/SavedModal';
import 'semantic-ui-css/semantic.min.css';
import styles from './App.module.css';
import SearchBar from './components/SearchBar';
import { flights } from './yeoo';
import { MdOutlineStarOutline, MdOutlineStar  } from "react-icons/md"; 

function App() {
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [starred, setStarred] = useState<boolean>(false);
  const [savedFlights, setSavedFlights] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchSavedFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights/saved/flights', {
        withCredentials: true,
      });
      console.log(response.data); 
      setSavedFlights(response.data);
    } catch (err) {
      console.error('Error fetching saved flights:', err);
    }
  };

  const fetchFlightData = async (flightNum: string) => {
    /*try {
      const response = await axios.get(`http://localhost:5000/api/flights/${flightNum}`);
      const data = response.data;
      setFlightData(data);
      setError(null); // Clear any previous error
      console.log('Fetched flight data:', data);
    } catch (err) {
      console.error('Error fetching flight data:', err);
      setError('Invalid flight number');
    }
    */
    setFlightData(flights);
  };

  const starClicked = async () => {
    setStarred(!starred)
    if (!starred) {
      try {
        await axios.post(
          `http://localhost:5000/api/flights/saved/flights`, 
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
          `http://localhost:5000/api/flights/saved/flights`, 
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
          <div className={styles.searchContainer} style={{ gap: '10px' }}>
            <SearchBar onSearch={fetchFlightData} />
            <button onClick={savedClicked} className={styles.savedButton}>Saved</button>
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>} {/* Error message */}
        </div>
      ) : (
        <>
          <div className={styles.leftColumn}>
            <div className={styles.searchContainer} style={{ width: '90%' }}>
              <button onClick={starClicked} className={styles.starButton}>
                {starred ? <MdOutlineStar className={styles.starIcon}/> : <MdOutlineStarOutline className={styles.starIcon}/>}
              </button> 
              <SearchBar onSearch={fetchFlightData} />
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
      />

    </div>
  );
}

export default App;
