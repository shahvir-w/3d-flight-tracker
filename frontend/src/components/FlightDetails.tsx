import styles from './styles/FlightDetails.module.css';
import { GiCommercialAirplane } from "react-icons/gi";
import { GoDotFill } from "react-icons/go";
import { Label } from 'semantic-ui-react'
import { FaPlane, FaTachometerAlt, FaCloud, FaClock, FaRoute, FaMapMarkerAlt } from "react-icons/fa";

const FlightDetails = ({ flightData }: { flightData: any }) => {
  const targetFlight = flightData.updatedTargetFlight;
  const previousFlights = flightData.twoPreviousFlights;
  const upcomingFlights = flightData.twoUpcomingFlights;

  return (
    <div className={styles.detailsContainer}>
        <div className={styles.airlineContainer}>
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

        {targetFlight.progress_percent < 100 && targetFlight.progress_percent > 0 && (
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
            <span className={styles.dateText}>{targetFlight.departure_date.slice(0, 10)}</span>
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
            <span className={styles.dateText}>{targetFlight.arrival_date.slice(0,10)}</span>
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

        {/* flight stats */}
        <h2 className={styles.flightStatsTitle}>FLIGHT STATS</h2>
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
              <span className={styles.value}>{`${targetFlight.groundSpeed? targetFlight.groundSpeed : 0} kph`}</span>
            </div>

            <div className={styles.statItem}>
              <FaCloud className={styles.icon} />
              <span className={styles.label2}>Altitude:</span>
              <span className={styles.value}>{`${targetFlight.altitude? targetFlight.altitude : 0} m`}</span>
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

        {/* other flights */}

        <div className={styles.tableContainer}>
          <h2>PREVIOUS FLIGHTS</h2>
          <table className={styles.flightTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Departure</th>
                <th>Arrival</th>
              </tr>
            </thead>
            <tbody>
              {previousFlights.length === 0 ? (
                <tr>
                  <td colSpan="3" className={styles.noFlights}>Unable to load</td>
                </tr>
              ) : (
                previousFlights.map((flight, index) => (
                  <tr key={index}>
                    <td>
                      <em>{flight.departure_date.slice(0, 10)}</em>
                    </td>
                    <td>
                      <em>{flight.actual_out? flight.actual_out.slice(0, 5) : flight.estimated_out.slice(0, 5)} EST</em>
                    </td>
                    <td>
                    <em>{flight.actual_in? flight.actual_in.slice(0, 5) : flight.estimated_in.slice(0, 5)} EST</em>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableContainer}>
          <h2>UPCOMING FLIGHTS</h2>
          <table className={styles.flightTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Departure</th>
                <th>Arrival</th>
              </tr>
            </thead>
            <tbody>
              {upcomingFlights.length === 0 ? (
                <tr>
                  <td colSpan="3" className={styles.noFlights}>Unable to load</td>
                </tr>
              ) : (
                upcomingFlights.map((flight, index) => (
                  <tr key={index}>
                    <td>
                      <em>{flight.departure_date.slice(0, 10)}</em>
                    </td>
                    <td>
                      <em>{flight.scheduled_out.slice(0, 5)} EST</em>
                    </td>
                    <td>
                      <em>{flight.scheduled_in.slice(0, 5)} EST</em>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

    </div>

      
  );
};

export default FlightDetails;
