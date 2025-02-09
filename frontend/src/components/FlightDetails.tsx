import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/FlightDetails.module.css';
import { FaSearch } from "react-icons/fa";
import { GiCommercialAirplane } from "react-icons/gi";
import { GoDotFill } from "react-icons/go";
import { Label } from 'semantic-ui-react'
import { FaPlane, FaTachometerAlt, FaCloud, FaClock, FaRoute, FaMapMarkerAlt } from "react-icons/fa";


const FlightDetails = () => {
  const [flightNum, setFlightNum] = useState('')
  const [targetFlight, setTargetFlight] = useState<any>('')

  const fetchFlightData = async (flightNum: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/flights/${flightNum}`);
      const data = response.data;

      const targetFlight = data.targetFlight;
      setTargetFlight(targetFlight);
      const perviousFlights = data.twoPreviousFlights;
      const upcomingFlights = data.twoUpcomingFlights;

      console.log("Fetched flight data:", data); 
    } catch (err) {
      console.error("Error fetching flight data:", err);
    }
  };

  return (
    <div className={styles.detailsContainer}>

      <form 
        className={styles.inputContainer}
        onSubmit={(e) => {
          e.preventDefault();
          fetchFlightData(flightNum)
        }}
      >
        <input 
          className={styles.input}
          type="text"
          placeholder="Flight #"
          onChange={(e) => setFlightNum(e.target.value)}
        />
        <button type="submit" className={styles.searchButton}>
          <FaSearch className={styles.searchIcon} />
        </button>
      </form>

      {targetFlight && (
        <>
        <div className={styles.airlineContainer}>
          <span className={styles.airlineName}>Airline</span>
          <span className={styles.separator}> / </span>
          <span className={styles.flightNumber}>{targetFlight.ident}</span>
          <span className={styles.separator}> / </span>
          <span className={styles.status}>{targetFlight.status}</span>
        </div>

        {/* Flight details */}
        <div className={styles.flightDetails}>
          {/* Departure City */}
          <div className={styles.cityContainer}>
            <div className={styles.cityName1}>{targetFlight.departure_city.airport_name}</div>
            <div className={styles.airportCode}>{targetFlight.departure_city.airport_code}</div>
          </div>

          {/* Status Bar */}
          <GiCommercialAirplane className={styles.planeIcon}/>

          {/* Arrival City */}
          <div className={styles.cityContainer}>
            <div className={styles.cityName2}>{targetFlight.arrival_city.airport_name}</div>
            <div className={styles.airportCode}>{targetFlight.arrival_city.airport_code}</div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className={styles.progressBarContainer}>
        <GoDotFill className={styles.dot} />
        
        <progress value={targetFlight.progress_percent} max="100" className={styles.progressBar} />
        <GoDotFill className={styles.dot} />
        </div>

        {targetFlight.progress_percent < 100 && (
          <>
            <div className={styles.labelContainer}>
              <Label pointing className={styles.label}>{`${targetFlight.timeElapsed} elapsed`}</Label>
              <Label pointing className={styles.label}>{`${targetFlight.timeRemaining} remaining`}</Label>
            </div>
          </>
        )}

        <div className={styles.timingData}>
          {/* Departure Section */}
          <div className={styles.departure_arrivalContainer}>
            
            <div className={styles.date}>
            <h3 className={styles.sectionTitle}>DEPERTURE</h3>
            <span className={styles.dateText}>{targetFlight.scheduled_out.slice(0,10)}</span>
            </div>
          
            
            <div className={styles.row}>
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>Scheduled</span>
                <span className={styles.sectionText}>{targetFlight.scheduled_out.slice(11,16)}</span>
              </div>
              
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>{targetFlight.actual_out ? "Actual" : "Estimated"}</span>
                <span className={styles.sectionText}>{targetFlight.actual_out ? targetFlight.actual_out.slice(11,16) : targetFlight.estimated_out.slice(11,16)}</span>
              </div>
            </div>
            
            <div className={styles.row1}>
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>Terminal</span>
                <span className={styles.sectionText}>{targetFlight.origin_terminal? targetFlight.origin_terminal : 'N/A'}</span>
              </div>
              
              <div className={styles.pair1}>
                <span className={styles.sectionTitle}>Gate</span>
                <span className={styles.sectionText}>{targetFlight.origin_gate? targetFlight.origin_gate : 'N/A'}</span>
              </div>
            </div>
          </div>


          {/* Arrival Section */}
          <div className={styles.departure_arrivalContainer}>
            
            <div className={styles.date}>
            <h3 className={styles.sectionTitle}>ARRIVAL</h3>
            <span className={styles.dateText}>{targetFlight.scheduled_in.slice(0,10)}</span>
            </div>
          
            
            <div className={styles.row}>
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>Scheduled</span>
                <span className={styles.sectionText}>{targetFlight.scheduled_in.slice(11,16)}</span>
              </div>
              
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>{targetFlight.actual_in ? "Actual" : "Estimated"}</span>
                <span className={styles.sectionText}>{targetFlight.actual_in ? targetFlight.actual_in.slice(11,16) : targetFlight.estimated_in.slice(11,16)}</span>
              </div>
            </div>
            
            <div className={styles.row1}>
              <div className={styles.pair}>
                <span className={styles.sectionTitle}>Terminal</span>
                <span className={styles.sectionText}>{targetFlight.destination_terminal? targetFlight.destination_terminal : 'N/A'}</span>
              </div>
              
              <div className={styles.pair1}>
                <span className={styles.sectionTitle}>Gate</span>
                <span className={styles.sectionText}>{targetFlight.destination_gate? targetFlight.destination_gate : 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

        <div className={styles.flightStats}>
          <div className={styles.col}>
            <div className={styles.statItem}>
              <FaPlane className={styles.icon} />
              <span className={styles.label2}>Aircraft:</span>
              <span className={styles.value}>{targetFlight.aircraft_type}</span>
            </div>

            <div className={styles.statItem}>
              <FaTachometerAlt className={styles.icon} />
              <span className={styles.label2}>Speed:</span>
              <span className={styles.value}>{`${targetFlight.groundspeed? targetFlight.groundspeed : 0} mi`}</span>
            </div>

            <div className={styles.statItem}>
              <FaCloud className={styles.icon} />
              <span className={styles.label2}>Altitude:</span>
              <span className={styles.value}>{`${targetFlight.altitude? targetFlight.altitude : 0} ft`}</span>
          </div>
          </div>

          <div className={styles.col}>
            <div className={styles.statItem}>
              <FaClock className={styles.icon} />
              <span className={styles.label2}>Total Time:</span>
              <span className={styles.value}>{targetFlight.totalTime}</span>
            </div>

            <div className={styles.statItem}>
              <FaRoute className={styles.icon} />
              <span className={styles.label2}>Dist. Total:</span>
              <span className={styles.value}>{`${targetFlight.route_distance} km`}</span>
            </div>

            <div className={styles.statItem}>
              <FaMapMarkerAlt className={styles.icon} />
              <span className={styles.label2}>Dist. Left:</span>
              <span className={styles.value}>{`${targetFlight.distanceRemaining} km`}</span>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default FlightDetails;
