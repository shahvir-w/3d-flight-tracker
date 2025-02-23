import React, { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import styles from './styles/SearchBar.module.css';

interface SearchBarProps {
  onSearch: (flightNum: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [flightNum, setFlightNum] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightNum) {
      onSearch(flightNum);
    }
  };

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Flight #"
        value={flightNum}
        onChange={(e) => setFlightNum(e.target.value)}
      />
      <button type="submit" className={styles.searchButton}>
        <FaSearch className={styles.searchIcon} />
      </button>
    </form>
  );
};

export default SearchBar;
