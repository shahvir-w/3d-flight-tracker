import styles from './styles/FlightDetails.module.css';
import { FaSearch } from "react-icons/fa";
import { GiCommercialAirplane } from "react-icons/gi";
import { GoDotFill } from "react-icons/go";
import { Label } from 'semantic-ui-react'
import { FaPlane, FaTachometerAlt, FaCloud, FaClock, FaRoute, FaMapMarkerAlt } from "react-icons/fa";


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
        <span className={styles.separator}> / </span>
        <span className={styles.status}>On Time</span>
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
        <div className={styles.departure_arrivalContainer}>
          
          <div className={styles.date}>
           <h3 className={styles.sectionTitle}>DEPERTURE</h3>
           <span className={styles.dateText}>05-Feb-2025</span>
          </div>
         
          
          <div className={styles.row}>
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Scheduled</span>
              <span className={styles.sectionText}>08:00</span>
            </div>
            
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Actual</span>
              <span className={styles.sectionText}>08:15</span>
            </div>
          </div>
          
          <div className={styles.row1}>
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Terminal</span>
              <span className={styles.sectionText}>1</span>
            </div>
            
            <div className={styles.pair1}>
              <span className={styles.sectionTitle}>Gate</span>
              <span className={styles.sectionText}>N/A</span>
            </div>
          </div>
        </div>


        {/* Arrival Section */}
        <div className={styles.departure_arrivalContainer}>
          
          <div className={styles.date}>
           <h3 className={styles.sectionTitle}>ARRIVAL</h3>
           <span className={styles.dateText}>05-Feb-2025</span>
          </div>
         
          
          <div className={styles.row}>
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Scheduled</span>
              <span className={styles.sectionText}>08:00</span>
            </div>
            
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Estimated</span>
              <span className={styles.sectionText}>08:15</span>
            </div>
          </div>
          
          <div className={styles.row1}>
            <div className={styles.pair}>
              <span className={styles.sectionTitle}>Terminal</span>
              <span className={styles.sectionText}>1</span>
            </div>
            
            <div className={styles.pair1}>
              <span className={styles.sectionTitle}>Gate</span>
              <span className={styles.sectionText}>N/A</span>
            </div>
          </div>
        </div>

      </div>

      <div className={styles.flightStats}>
        <div className={styles.col}>
          <div className={styles.statItem}>
            <FaPlane className={styles.icon} />
            <span className={styles.label2}>Aircraft:</span>
            <span className={styles.value}>Boeing 787</span>
          </div>

          <div className={styles.statItem}>
            <FaTachometerAlt className={styles.icon} />
            <span className={styles.label2}>Speed:</span>
            <span className={styles.value}>870 km/h</span>
          </div>

          <div className={styles.statItem}>
            <FaCloud className={styles.icon} />
            <span className={styles.label2}>Altitude:</span>
            <span className={styles.value}>35,000 ft</span>
         </div>
        </div>

        <div className={styles.col}>
          <div className={styles.statItem}>
            <FaClock className={styles.icon} />
            <span className={styles.label2}>Total Time:</span>
            <span className={styles.value}>8h 15m</span>
          </div>

          <div className={styles.statItem}>
            <FaRoute className={styles.icon} />
            <span className={styles.label2}>Dist. Total:</span>
            <span className={styles.value}>6,500 km</span>
          </div>

          <div className={styles.statItem}>
            <FaMapMarkerAlt className={styles.icon} />
            <span className={styles.label2}>Dist. Left:</span>
            <span className={styles.value}>1,200 km</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FlightDetails;
