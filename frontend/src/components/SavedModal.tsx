import React from 'react';
import styles from './styles/SavedModal.module.css';
import { IoMdClose } from "react-icons/io";


type savedFlight = {
  flightNumber: string;
  departureCity: any;
  arrivalCity: any;
}

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFlights: savedFlight[];
  fetchFlightData: (flightNum: string) => void;
}

const SavedModal: React.FC<SavedModalProps> = ({ isOpen, onClose, savedFlights, fetchFlightData }) => {
  if (!isOpen) return null;

  const handleFlightClick = (flightNumber: string) => {
    fetchFlightData(flightNumber);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.xButton}>
          <IoMdClose className={styles.xIcon} />
        </button>

        {savedFlights.length === 0 ? (
          <p>. . . </p>
        ) : (
          <div className={styles.flightList}>
            {savedFlights.map((flight, index) => (
              <button key={index} className={styles.flightItem} onClick={() => handleFlightClick(flight.flightNumber)}>
              {/* Departure City */}
              <div className={styles.cityContainer}>
                <div className={styles.cityName1}>{flight.departureCity.airport_name}</div>
                <div className={styles.airportCode}>{flight.departureCity.airport_code}</div>
              </div>
              
              <div className={styles.middle}>
                <div className={styles.flightNumber}>{flight.flightNumber}</div>
                <div className={styles.arrow}>
                  <div className={styles.line}></div>
                  <div className={styles.point}></div>
                </div>
              </div>
    
              {/* Arrival City */}
              <div className={styles.cityContainer}>
                <div className={styles.cityName2}>{flight.arrivalCity.airport_name}</div>
                <div className={styles.airportCode}>{flight.arrivalCity.airport_code}</div>
              </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedModal;
