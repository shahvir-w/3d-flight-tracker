import React, { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import styles from './styles/SearchBar.module.css';

interface SearchBarProps {
  onSearch: (flightNum: string) => void;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [flightNum, setFlightNum] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNum && !isLoading) {
      onSearch(flightNum);
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder={isLoading ? "Fetching data..." : "Flight #"}
        value={flightNum}
        onChange={(e) => setFlightNum(e.target.value)}
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className={styles.searchButton} 
        disabled={isLoading}
      >
        {isLoading ? (
          <FaSpinner className={`${styles.searchIcon} ${styles.spinnerIcon}`} />
        ) : (
          <FaSearch className={styles.searchIcon} />
        )}
      </button>
    </form>
  );
};

export default SearchBar;
