import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import FlightDetailsPage from './pages/FlightDetailsPage';
import styles from './App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/flight" element={<FlightDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
