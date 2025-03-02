import React from 'react';
import styles from './styles/SavedModal.module.css';
import { IoMdClose } from "react-icons/io";

interface SavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFlights: string[]; // Assuming saved flights are just flight numbers
}

const SavedModal: React.FC<SavedModalProps> = ({ isOpen, onClose, savedFlights }) => {
  if (!isOpen) return null; // Don't render modal if it's not open

  return (
    <div onClick={onClose} className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.xButton}>
            <IoMdClose className={styles.xIcon}/>
        </button>

        <ul>
          {savedFlights.length === 0 ? (
            <p>No saved flights yet!</p>
          ) : (
            savedFlights.map((flight, index) => <li key={index}>{flight}</li>)
          )}
        </ul>
      </div>
    </div>
  );
};

export default SavedModal;
