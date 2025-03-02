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

  useEffect(() => {
    const fetchSavedFlights = async () => {
      try {
          const response = await axios.get('http://localhost:5000/api/flights/saved', { withCredentials: true });
          console.log(response.data);  // Check the array of saved flights
          setSavedFlights(response.data);  // Set the saved flights in the state
      } catch (err) {
          console.error('Error fetching saved flights:', err);
      }
    };

    fetchSavedFlights();
  }, []);


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
    console.log(flightData)
    if (!starred) {
      try {

        const response = await axios.post(
          `http://localhost:5000/api/flights/saved`,  // No need to include the flightData in the URL
          {
            flightNumber: flightData.updatedTargetFlight.ident,  // Send the flight data in the request body
          }
        );
        console.log(response.data);
      } catch (err) {
        console.error('Error fetching saved flights:', err);
      }
    }    
  }

  const savedClicked = async () => {
    console.log(savedFlights);
  } 

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
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
