import Globe from './components/Globe';
import FlightDetails from './components/FlightDetails';
import 'semantic-ui-css/semantic.min.css'
import styles from './App.module.css';


function App() {
  return (
    <div className={styles.appContainer}>
      <FlightDetails />
      <Globe />
    </div>
  );
}

export default App;

