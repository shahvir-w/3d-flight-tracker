import { useState } from 'react';
import axios from 'axios';
import Globe from './components/Globe';
import FlightDetails from './components/FlightDetails';
import 'semantic-ui-css/semantic.min.css';
import styles from './App.module.css';
import SearchBar from './components/SearchBar';
import { flights } from './yeoo'; 

function App() {
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchFlightData = async (flightNum: string) => {
    /*
    try {
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
     setFlightData(flights)
  };
  
  return (
    <div className={styles.appContainer}>
      {!flightData ? (
        <div className={styles.centeredContainer}>
          <SearchBar onSearch={fetchFlightData} />
          {error && <div className={styles.errorMessage}>{error}</div>} {/* Error message */}
        </div>
      ) : (
        <>
          <div className={styles.leftColumn}>
            <SearchBar onSearch={fetchFlightData} />
            <FlightDetails flightData={flightData} />
          </div>
          <div className={styles.rightColumn}>
            <Globe />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
