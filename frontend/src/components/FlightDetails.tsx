import styles from './styles/FlightDetails.module.css';
import { IoSearchCircle } from "react-icons/io5";

const FlightDetails = () => {
  return (
    <div className={styles.detailsContainer}>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="text"
          placeholder="Flight #"
        />
        <button className={styles.searchButton}>
          <IoSearchCircle className={styles.searchIcon} />
        </button>
      </div>

      <div className={styles.airlineContainer}>
        <span className={styles.airlineName}>Air Canada</span>
        <span className={styles.flightNumber}>AC1976</span>
      </div>

    </div>
  );
};

export default FlightDetails;
