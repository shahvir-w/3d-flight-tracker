import styles from './styles/FlightDetails.module.css';
import { FaSearch } from "react-icons/fa";
import { GiCommercialAirplane } from "react-icons/gi";
import { GoDotFill } from "react-icons/go";
import { Label } from 'semantic-ui-react'


const FlightDetails = () => {
  return (
    <div className={styles.detailsContainer}>

      <form className={styles.inputContainer}>
        <input
          className={styles.input}
          type="text"
          placeholder="Flight #"
        />
        <button className={styles.searchButton}>
          <FaSearch className={styles.searchIcon} />
        </button>
      </form>

      <div className={styles.airlineContainer}>
        <span className={styles.airlineName}>Air Canada</span>
        <span className={styles.separator}> / </span>
        <span className={styles.flightNumber}>AC1976</span>
      </div>

      {/* Flight details */}
      <div className={styles.flightDetails}>
        {/* Departure City */}
        <div className={styles.cityContainer}>
          <div className={styles.cityName1}>Toronto Pearson Intl</div>
          <div className={styles.airportCode}>YYZ</div>
        </div>

        {/* Status Bar */}
        <GiCommercialAirplane className={styles.planeIcon}/>

        {/* Arrival City */}
        <div className={styles.cityContainer}>
          <div className={styles.cityName2}>New York JFK Intl</div>
          <div className={styles.airportCode}>JFK</div>
        </div>
      </div>

      {/* Progress Bar Container */}
       <div className={styles.progressBarContainer}>
      <GoDotFill className={styles.dot} />
      
      <progress value={80} max="100" className={styles.progressBar} />
      <GoDotFill className={styles.dot} />
      </div>

      <div className={styles.labelContainer}>
        <Label pointing className={styles.label}>1h 32m elapsed</Label>
        <Label pointing className={styles.label}>6h 28m remaining</Label>
      </div>

      <div className={styles.timingData}>
        {/* Departure Section */}
        <div className={styles.departureContainer}>
          <div className={styles.date}>
           <h3 className={styles.sectionTitle}>Departure</h3>
           <span className={styles.data}>Feb 10, 2025</span>
          </div>
         
          
          <div className={styles.flightInfo}>
            
          </div>
          
          
          <div className={styles.flightInfo}>
            <span className={styles.label1}>Scheduled</span>
            <span className={styles.data}>08:00</span>
          </div>
          
          <div className={styles.flightInfo}>
            <span className={styles.label1}>Actual</span>
            <span className={styles.data}>08:15</span>
          </div>
          
          <div className={styles.flightInfo}>
            <span className={styles.label1}>Terminal</span>
            <span className={styles.data}>3</span>
          </div>
          
          <div className={styles.flightInfo}>
            <span className={styles.label1}>Gate</span>
            <span className={styles.data}>F12</span>
          </div>
        </div>

        
      </div>

    </div>
  );
};

export default FlightDetails;
